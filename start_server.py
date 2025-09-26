#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8080
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server():
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Servidor iniciado com sucesso!")
            print(f"📁 Pasta: {DIRECTORY}")
            print(f"🌐 URL: http://localhost:{PORT}")
            print(f"🌐 URL: http://127.0.0.1:{PORT}")
            print(f"⏹️  Pressione Ctrl+C para parar")
            print("-" * 50)
            
            # Abrir o navegador automaticamente
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🌐 Navegador aberto automaticamente!")
            except:
                print("⚠️  Não foi possível abrir o navegador automaticamente")
            
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print(f"❌ Erro: Porta {PORT} já está em uso!")
            print("💡 Tente fechar outros programas que usam a porta 8080")
        else:
            print(f"❌ Erro ao iniciar servidor: {e}")
    except KeyboardInterrupt:
        print("\n⏹️  Servidor parado pelo usuário")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    start_server()
