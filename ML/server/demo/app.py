from flask import Flask, render_template

server = Flask(__name__)

@server.route('/')
@server.route('/home')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    server.run(debug=True)