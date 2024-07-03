import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from uuid import uuid4
from dotenv import load_dotenv
from threading import Lock

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/*": {"origins": os.getenv('FRONTEND_URL')}})
app_port = int(os.getenv('PORT'))
frontend_url = os.getenv('FRONTEND_URL')

sessions = {}
sessions_lock = Lock()

class ClientInfo:
    def __init__(self, sid, nickname):
        self.sid = sid
        self.nickname = nickname

class Session:
    def __init__(self):
        self.clients = set()
        self.messages = []

@socketio.on('connect')
def handle_connect():
    session_id = request.args.get('sessionId')
    nickname = request.args.get('nickName')
    
    if session_id and nickname:
        with sessions_lock:
            if session_id in sessions:
                client_info = ClientInfo(request.sid, nickname)
                sessions[session_id].clients.add(client_info)
                join_room(session_id)

                print(f'New client connected to session {session_id}')

                broadcast_client_list(session_id)
                emit('messageList', sessions[session_id].messages)
            else:
                return False
    else:
        return False

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.args.get('sessionId')
    
    if session_id:
        with sessions_lock:
            if session_id in sessions:
                client_to_remove = None
                for client in sessions[session_id].clients:
                    if client.sid == request.sid:
                        client_to_remove = client
                        break
                
                if client_to_remove:
                    sessions[session_id].clients.remove(client_to_remove)
                    if len(sessions[session_id].clients) == 0:
                        del sessions[session_id]
                    else:
                        broadcast_client_list(session_id)

@socketio.on('message')
def handle_message(message):
    session_id = request.args.get('sessionId')
    
    if session_id:
        with sessions_lock:
            if session_id in sessions:
                client = next((c for c in sessions[session_id].clients if c.sid == request.sid), None)
                if client:
                    sessions[session_id].messages.append({'client': client, 'message': message})
                    broadcast_message_history(session_id)

def broadcast_client_list(session_id):
    with sessions_lock:
        client_list = [client.nickname for client in sessions[session_id].clients]
        for client in sessions[session_id].clients:
            emit('clientList', client_list, to=client.sid)

def broadcast_message_history(session_id):
    with sessions_lock:
        message_history = sessions[session_id].messages
        for client in sessions[session_id].clients:
            emit('messageList', [
                {**message, 'isMine': message['client'] == client}
                for message in message_history
            ], to=client.sid)

@app.route('/create-session', methods=['POST'])
def create_session():
    session_id = str(uuid4())
    with sessions_lock:
        sessions[session_id] = Session()
    return jsonify(sessionId=session_id)

@app.route('/session/<session_id>/clients', methods=['GET'])
def get_clients(session_id):
    with sessions_lock:
        if session_id in sessions:
            clients = [client.nickname for client in sessions[session_id].clients]
            return jsonify(clients=clients)
        else:
            return jsonify(error='Session not found'), 404

@app.route('/session/<session_id>/clients/<int:client_index>', methods=['DELETE'])
def delete_client(session_id, client_index):
    with sessions_lock:
        if session_id in sessions:
            clients = list(sessions[session_id].clients)
            if 0 <= client_index < len(clients):
                client_to_remove = clients[client_index]
                sessions[session_id].clients.remove(client_to_remove)
                socketio.close_room(client_to_remove.sid)
                broadcast_client_list(session_id)
                return '', 200
            else:
                return jsonify(error='Client not found'), 404
        else:
            return jsonify(error='Session not found'), 404



if __name__ == '__main__':
    print(f'dev server running at: http://localhost:{app_port}/')
    print(f'FRONTEND_URL: {frontend_url}')
    print(f'PORT: {app_port}')
    socketio.run(app, port=app_port, debug=True, allow_unsafe_werkzeug=True)
