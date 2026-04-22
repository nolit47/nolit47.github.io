import http.server, socketserver, webbrowser, os

PORT = 8080

os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({'.wav': 'audio/wav'})

with socketserver.TCPServer(("", PORT), handler) as httpd:
    url = f"http://localhost:{PORT}/tellme.html"
    print({url})
    webbrowser.open(url)
    httpd.serve_forever()