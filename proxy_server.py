#!/usr/bin/env python3.11
"""
CORS Proxy Server for AWS API Gateway
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import urllib.request
import urllib.error

class CORSProxyHandler(SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/chat':
            try:
                # Read request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Forward to AWS API Gateway
                api_url = 'https://bzlc53x57k.execute-api.us-east-1.amazonaws.com/Prod/Chat'
                req = urllib.request.Request(
                    api_url,
                    data=post_data,
                    headers={'Content-Type': 'application/json'}
                )
                
                # Get response
                with urllib.request.urlopen(req, timeout=60) as response:
                    response_data = response.read()
                
                # Send response
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(response_data)
                
            except urllib.error.HTTPError as e:
                error_response = json.dumps({
                    'error': f'API Error: {e.code} {e.reason}'
                }).encode()
                self.send_response(e.code)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(error_response)
                
            except Exception as e:
                error_response = json.dumps({
                    'error': str(e)
                }).encode()
                self.send_response(500)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(error_response)
        else:
            # Serve static files
            super().do_GET()
    
    def do_GET(self):
        """Handle GET requests for static files"""
        self.send_cors_headers()
        super().do_GET()
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def end_headers(self):
        """Override to add CORS headers to all responses"""
        super().end_headers()

def run_server(port=8081):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CORSProxyHandler)
    print(f'Starting proxy server on port {port}...')
    print(f'Proxy endpoint: http://localhost:{port}/api/chat')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
