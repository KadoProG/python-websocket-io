import asyncio
import websockets

async def handler(websocket, path):
    while True:
        message = await websocket.recv()
        print(f"Received message: {message}")
        response = f"Echo: {message}"
        await websocket.send(response)

async def main():
    print("Starting server... ws://localhost:8765")
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
