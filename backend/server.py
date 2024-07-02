import asyncio
import websockets
import json

messages = []

async def handler(websocket, path):
    while True:
        message = await websocket.recv()
        print(f"Received message: {message}")
        messages.append(message)
        json_string = json.dumps({"messages": messages}, ensure_ascii=False, indent=4)
        await websocket.send(json_string)

async def main():
    print("Starting server... ws://localhost:8765")
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
