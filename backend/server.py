import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from uuid import uuid4
from dotenv import load_dotenv
import threading
import time
import json
from io import StringIO

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*", transports=['websocket'])
CORS(app, resources={r"/*": {"origins": "*"}})
app_port = int(os.getenv('PORT'))
frontend_url = os.getenv('FRONTEND_URL')

sessions = {}

class ClientInfo:
    def __init__(self, sid, nickname):
        self.sid = sid
        self.nickname = nickname

class Session:
    def __init__(self):
        self.clients = set()
        self.messages = []

def broadcast_client_list(session_id):
    print("Attempting to broadcast client list")
    
    if session_id not in sessions:
        print(f"Session {session_id} not found.")
        return
    
    if not sessions[session_id].clients:
        print(f"No clients in session {session_id}.")
        return

    client_list = [client.nickname for client in sessions[session_id].clients]
    print(f"Client list for session {session_id}: {client_list}")
    
    for client in sessions[session_id].clients:
        print(f"Emitting client list to {client.sid}")
        try:
            emit('clientList', client_list, to=client.sid)
        except Exception as e:
            print(f"Error emitting to {client.sid}: {e}")

def broadcast_message_history(session_id):
    message_history = sessions[session_id].messages
    for client in sessions[session_id].clients:
        emit('messageList', [
            {**message, 'isMine': message['client'] == client}
            for message in message_history
        ], to=client.sid)

@socketio.on('connect')
def handle_connect():
    print("Client trying to connect...")

    session_id = request.args.get('sessionId')
    nickname = request.args.get('nickname')
    
    if session_id and nickname:
        print(f'Client connected to session {session_id} with nickname {nickname}')
        
        if session_id in sessions:
            print(f'Client connected to session {session_id} with nickname {nickname} 2')
            client_info = ClientInfo(request.sid, nickname)
            sessions[session_id].clients.add(client_info)
            print(f'Client connected to session {session_id} with nickname {nickname} 3')
            join_room(session_id)
            print(f'Client connected to session {session_id} with nickname {nickname} 4')

            broadcast_client_list(session_id)
            print(f'Client connected to session {session_id} with nickname {nickname} 5')
            emit('messageList', sessions[session_id].messages)
            print(f'Client connected to session {session_id} with nickname {nickname} 6')
        else:
            return False
    else:
        return False

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.args.get('sessionId')
    
    if session_id and session_id in sessions:
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
    print(f"Received message: {message}")
    
    print(StringIO(message))
    session_id = request.args.get('sessionId')
    print(f"Session ID: {session_id}")
    
    if session_id and session_id in sessions:
        client = next((c for c in sessions[session_id].clients if c.sid == request.sid), None)
        if client:
            sessions[session_id].messages.append({'client': client, 'message': message})
            broadcast_message_history(session_id)

@app.route('/create-session', methods=['POST'])
def create_session():
    session_id = str(uuid4())
    sessions[session_id] = Session()
    return jsonify(sessionId=session_id)

@app.route('/session/<session_id>/clients', methods=['GET'])
def get_clients(session_id):
    if session_id in sessions:
        clients = [client.nickname for client in sessions[session_id].clients]
        return jsonify(clients=clients)
    else:
        return jsonify(error='Session not found'), 404

@app.route('/session/<session_id>/clients/<int:client_index>', methods=['DELETE'])
def delete_client(session_id, client_index):
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

def print_message():
    while True:
        print(sessions)
        time.sleep(4)

if __name__ == '__main__':
    message_thread = threading.Thread(target=print_message)
    message_thread.daemon = True
    message_thread.start()

    print(f'dev server running at: http://localhost:{app_port}/')
    print(f'FRONTEND_URL: {frontend_url}')
    print(f'PORT: {app_port}')
    socketio.run(app, host="0.0.0.0", port=app_port, debug=True, allow_unsafe_werkzeug=True)
