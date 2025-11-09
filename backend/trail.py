# import flast module
from dotenv import load_dotenv, dotenv_values
import os
from flask import Flask, redirect, jsonify, make_response, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

# instance of flask application
app = Flask(__name__)
load_dotenv()
app.config["JWT_SECRET_KEY"] = "dsdhfdfkdjcvnfvsfdgghgbvd"
jwt = JWTManager(app)
# home route that redirects to
# helloworld page


@app.route('/login', methods=['POST'])
def fetchLoginCredentials():
    accessToken = create_access_token(identity=1)
    return jsonify({"status": "success", "message": "Login successful",
                    "value": {"name": "nagendra", "userId": 1, "accessToken": accessToken}
                    }), 200

# route that returns hello world text


@app.route("/signup")
@jwt_required
def hello_world():
    return make_response(jsonify({"msg": "hello"}))


@app.route('/askquestion', methods=['POST'])
@jwt_required()
def uploadQuestion():
    if request.method == 'POST':
        data = request.json
        try:
            tags = data.get('tags')
            tags = ','.join(tags)
            return make_response(jsonify({"message": "User created successfuly"}), 201)
            question = Question(title=data.get('title'), body=data.get(
                'body'), tags=data.get('tags'), userId=get_jwt_identity())
            db.session.add(question)
            db.session.commit()
            return jsonify({"status": "success", "message": "Data Entered Successfully"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": f"Server Error: {str(e)}"}), 500


# importing necessary functions from dotenv library
# loading variables from .env file


if __name__ == '__main__':
    app.debug = True
    app.run()
