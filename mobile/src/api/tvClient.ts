import { encode as btoa } from 'base-64';
import TcpSocket from 'react-native-tcp-socket';

// Helper for Legacy TV Protocol
const serializeString = (str: string, isBase64: boolean): number[] => {
  const payloadStr = isBase64 ? btoa(str) : str;
  const bytes: number[] = [];
  for (let i = 0; i < payloadStr.length; i++) {
    bytes.push(payloadStr.charCodeAt(i));
  }
  return [bytes.length, 0x00, ...bytes];
};

const serializeRawBytes = (bytes: number[]): number[] => {
  return [bytes.length, 0x00, ...bytes];
};

class TVClient {
  private ws: WebSocket | null = null;
  private tcpClient: any = null;
  private ip: string = '';
  private appName: string = 'Teleremo';
  private connectionType: 'websocket' | 'tcp' | null = null;

  private getEncodedName() {
    return btoa(this.appName);
  }

  public connect(ip: string, onSuccess?: () => void, onError?: (err: any) => void) {
    this.ip = ip;
    const name = this.getEncodedName();
    this.connectionType = null;
    
    // 3. Fallback: Legacy TCP (Port 55000) for pre-2016 TVs
    const tryConnectLegacy = () => {
      console.log('Trying Legacy TCP port 55000...');
      try {
        const client = TcpSocket.createConnection({
          port: 55000,
          host: this.ip,
        }, () => {
          console.log('Connected to Legacy TV on port 55000');
          this.connectionType = 'tcp';
          this.tcpClient = client;

          // Send handshake
          const payload = [
            0x64, 0x00,
            ...serializeString("Teleremo Mobile", true),
            ...serializeString("00-00-00-00-00-00", true),
            ...serializeString("Teleremo", true)
          ];
          const packet = [0x00, 0x00, 0x00, ...serializeRawBytes(payload)];
          
          client.write(new Uint8Array(packet));
          if (onSuccess) onSuccess();
        });

        client.on('error', (error: any) => {
          console.log('TCP Socket Error:', error);
          if (onError) onError(error);
        });

        client.on('close', () => {
          console.log('TCP Socket closed');
          this.tcpClient = null;
        });

        // Some Android OS timeout handling
        setTimeout(() => {
          if (!this.tcpClient && this.connectionType !== 'tcp') {
             client.destroy();
             if (onError) onError(new Error("TCP Timeout"));
          }
        }, 5000);

      } catch (error) {
        if (onError) onError(error);
      }
    };

    // 1. & 2. Try WebSocket 8001 -> 8002
    const tryConnectWS = (url: string) => {
      try {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          console.log('Connected to TV (WebSocket):', url);
          this.connectionType = 'websocket';
          if (onSuccess) onSuccess();
        };

        this.ws.onerror = (e) => {
          console.log('WebSocket Error on', url);
          if (url.includes('8001')) {
            console.log('Trying fallback port 8002...');
            tryConnectWS(`wss://${this.ip}:8002/api/v2/channels/samsung.remote.control?name=${name}`);
          } else {
            console.log('WebSocket fallback failed. Trying Legacy TCP 55000...');
            tryConnectLegacy();
          }
        };

        this.ws.onclose = () => {
          console.log('TV WebSocket Closed');
          this.ws = null;
        };
      } catch (error) {
        tryConnectLegacy();
      }
    };

    // Önce 8001 (Güvensiz - SSL Hatası vermez) portunu dene
    tryConnectWS(`ws://${this.ip}:8001/api/v2/channels/samsung.remote.control?name=${name}`);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.tcpClient) {
      this.tcpClient.destroy();
      this.tcpClient = null;
    }
    this.connectionType = null;
  }

  public sendKey(key: string) {
    if (this.connectionType === 'websocket') {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.warn('Cannot send key, WebSocket is not open.');
        return;
      }
      const payload = {
        method: 'ms.remote.control',
        params: {
          Cmd: 'Click',
          DataOfCmd: key,
          Option: 'false',
          TypeOfRemote: 'SendRemoteKey',
        },
      };
      this.ws.send(JSON.stringify(payload));
    } else if (this.connectionType === 'tcp') {
      if (!this.tcpClient) {
        console.warn('Cannot send key, TCP socket is not open.');
        return;
      }
      
      const payload = [
        0x00, 0x00, 0x00,
        ...serializeString(key, true)
      ];
      const packet = [0x00, 0x00, 0x00, ...serializeRawBytes(payload)];
      
      this.tcpClient.write(new Uint8Array(packet));
    } else {
      console.warn('Cannot send key, no active connection.');
    }
  }
}

export const tvClient = new TVClient();
