from flask import Flask, request, render_template, jsonify
from flask_cors import CORS

server = Flask(__name__)

@server.route('/')
@server.route('/home')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    server.run(debug=True)