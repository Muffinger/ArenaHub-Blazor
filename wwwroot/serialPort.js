let serialPort;
let textDecoder;
let reader;

async function connectSerial() {
    try {
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({ baudRate: 9600 });

        textDecoder = new TextDecoderStream();
        reader = serialPort.readable.pipeTo(textDecoder.writable);
        const readerStream = textDecoder.readable.getReader();

        while (true) {
            const { value, done } = await readerStream.read();
            if (done) break;
            console.log("Serial Data:", value);
            DotNet.invokeMethodAsync('ArenaHub-Blazor', 'ReceiveSerialData', value);
        }
    } catch (err) {
        console.error("Serial Connection Error:", err);
    }
}

async function sendSerialData(data) {
    if (!serialPort || !serialPort.writable) {
        console.error("No serial port connection");
        return;
    }

    const writer = serialPort.writable.getWriter();
    await writer.write(new TextEncoder().encode(data));
    writer.releaseLock();
}
