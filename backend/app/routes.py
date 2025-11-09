from flask import request, jsonify, current_app
from flask import Blueprint
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from app.models import User, Question, Comment, CommentLike, QuestionLike, Tag, QuestionTag, UserProfile, SearchHistory, db
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, or_, desc
from sqlalchemy.orm import joinedload
api = Blueprint('api', __name__)


def update_user_profile_count(userId, question_increment=False):
    user_profile = UserProfile.query.filter(
        UserProfile.userId == userId).first()
    if user_profile:
        if question_increment:
            user_profile.questionsCount += 1
        else:
            user_profile.questionsCount -= 1
        db.session.add(user_profile)


@api.route("/", methods=["POST", "GET"])
def home():
    current_app.logger.info("Accessed home route")
    return jsonify({"name": "Hello World"})


@api.route('/refresh')
def refreshToken():
    current_app.logger.info("Accessed refresh token route")
    return {}

# login and signup routes


@api.route('/login', methods=['POST'])
def fetchLoginCredentials():
    current_app.logger.info("Accessed login route")
    email = request.json.get('email')
    password = request.json.get('password')

    if not email or not password:
        current_app.logger.error("Email and password are required")
        return jsonify({"status": "error", "message": "Email and password are required"}), 400

    try:
        user = db.session.query(User).filter(User.email == email).first()
        if user and user.password == password:
            access_token = create_access_token(identity=str(user.userId))
            current_app.logger.info(
                "Login successful for user: %s", user.userName)
            return jsonify({"status": "success", "message": "Login successful",
                            "data": {"name": user.userName[0].upper()+user.userName[1:],
                                     "userId": user.userId,
                                     "accessToken": access_token}
                            }), 200
        else:
            current_app.logger.warning("Invalid login credentials")
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error during login: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route('/signup', methods=['POST'])
def uploadUserCredentials():
    current_app.logger.info("Accessed signup route")
    data = request.json
    try:
        # Create and add the User object
        user = User(userName=data.get('name'), email=data.get(
            'email'), password=data.get('password'))
        db.session.add(user)
        db.session.commit()  # Commit to generate the userId

        # Use the generated userId to create the UserProfile
        userProfile = UserProfile(userId=user.userId, location=data.get("location"), dob=data.get("dob"),
                                  github=data.get("github"), leetcode=data.get("leetcode"))
        db.session.add(userProfile)
        db.session.commit()

        # Generate the access token
        access_token = create_access_token(identity=str(user.userId))
        current_app.logger.info(
            "User signed up successfully: %s", user.userName)

        return jsonify({
            "status": "success",
            "message": "Data Entered Successfully",
            "data": {
                "accessToken": access_token,
                "userId": user.userId,
                "name": user.userName[0].upper() + user.userName[1:],
                "email": user.email
            }
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error during signup: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route('/checkemail', methods=['POST'])
def checkEmail():
    current_app.logger.info("Accessed check email route")
    data = request.json
    try:
        user = db.session.query(User).filter(
            User.email == data.get('email')).first()
        if user:
            current_app.logger.info(
                "Email already exists: %s", data.get('email'))
            return jsonify({"status": "error", "message": "Email already exists. Please login!"}), 409
        current_app.logger.info("Email is available: %s", data.get('email'))
        return jsonify({"status": "success", "message": "Email not present"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error during email check: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500

# tag routes


@api.route('/question/tags', methods=["POST"])
def getTags():
    data = request.json
    try:
        query = data.get('label', '').strip()
        if query:
            tags = Tag.query.filter(Tag.label.ilike(f"{query}%")).all()
        else:
            tags = Tag.query.all()

        # Convert tags to a list of dictionaries
        tags_list = [{"id": tag.tagId, "label": tag.label} for tag in tags]

        return jsonify({"success": True, "tags": tags_list}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error during email check: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


# question routes
@api.route('/askquestion', methods=['POST'])
@jwt_required()
def uploadQuestion():
    current_app.logger.info("Accessed ask question route")
    data = request.json
    try:
        userId = int(get_jwt_identity())
        question = Question(title=data.get('title'),
                            body=data.get('body'), userId=userId)
        db.session.add(question)

        # Update user profile for questions count
        update_user_profile_count(userId, question_increment=True)

        # Process tags
        tags = data.get('tags', [])
        question_tags = []
        for tag_label in tags:
            tag = Tag.query.filter_by(label=tag_label).first()
            if not tag:
                tag = Tag(label=tag_label)
                db.session.add(tag)
                db.session.commit()
            question_tags.append(QuestionTag(
                tagId=tag.tagId, questionId=question.questionId))

        db.session.add_all(question_tags)
        db.session.commit()

        current_app.logger.info("Question posted by userId: %s", userId)
        return jsonify({"status": "success", "message": "Data Entered Successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error("Error during question upload", exc_info=True)
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route('/questions', methods=['POST'])
def get_questions():
    current_app.logger.info("Accessed get_questions route")
    try:
        order_by = request.args.get('orderBy', default='questionId', type=str)
        data = request.json or {}
        tags_filter = data.get("tags", [])

        questions_query = Question.query

        if tags_filter:
            questions_query = questions_query.join(QuestionTag).join(
                Tag).filter(Tag.label.in_(tags_filter)).distinct()

        if order_by == "votes":
            questions_query = questions_query.order_by(
                Question.likesCount.desc())
        elif order_by == "new":
            questions_query = questions_query.order_by(Question.updatedAt)
        elif order_by == "Unanswered":
            questions_query = questions_query.filter(
                Question.commentsCount == 0)
        else:
            questions_query = questions_query.order_by(
                Question.questionId.desc())

        questions = questions_query.all()

        questions_list = []
        for question in questions:
            question_dict = question.to_dict()
            tags = (
                db.session.query(Tag.label)
                .join(QuestionTag, QuestionTag.tagId == Tag.tagId)
                .filter(QuestionTag.questionId == question.questionId)
                .all()
            )
            tag_labels = [tag.label for tag in tags]
            question_dict['tags'] = tag_labels
            questions_list.append(question_dict)

        return jsonify({
            "status": "success",
            "message": "Data Fetched Successfully",
            "data": {"questions": questions_list},
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error fetching questions: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route('/search', methods=['POST'])
def search():
    current_app.logger.info("Accessed Search route")
    try:
        data = request.json or {}
        order_by = request.args.get('orderBy', default='questionId', type=str)
        search_query = request.args.get('query', default='', type=str).lower()
        tags_filter = data.get("tags", [])

        questions_query = Question.query

        if search_query:
            questions_query = questions_query.filter(
                or_(
                    Question.title.ilike(f"%{search_query}%"),
                    Question.body.ilike(f"%{search_query}%")
                )
            )

        if tags_filter:
            questions_query = questions_query.join(QuestionTag).join(
                Tag).filter(Tag.label.in_(tags_filter)).distinct()

        if order_by == "votes":
            questions_query = questions_query.order_by(
                Question.likesCount.desc())
        elif order_by == "new":
            questions_query = questions_query.order_by(
                Question.updatedAt.desc())
        elif order_by == "Unanswered":
            questions_query = questions_query.filter(
                Question.commentsCount == 0)
        else:
            questions_query = questions_query.order_by(
                Question.questionId.desc())

        questions = questions_query.all()
        questions_list = []
        for question in questions:
            question_dict = question.to_dict()

            # Fetch tags for the current question
            tags = (
                db.session.query(Tag.label)
                .join(QuestionTag, QuestionTag.tagId == Tag.tagId)
                .filter(QuestionTag.questionId == question.questionId)
                .all()
            )

            # Convert list of tuples to a flat list
            tag_labels = [tag.label for tag in tags]
            question_dict['tags'] = tag_labels

            questions_list.append(question_dict)

        return jsonify({
            "status": "success",
            "message": "Data Fetched Successfully",
            "data": {"questions": questions_list},
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error fetching questions: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route('/questions/history', methods=['GET'])
@jwt_required()
def searchHistory():
    current_app.logger.info("Accessed search history route")
    userId = get_jwt_identity()
    try:
        if not userId:
            return jsonify({"status": "error", "message": "User not found"}), 404

        # Step 1: Get unique tagIds from recent search history
        search_history = (
            db.session.query(SearchHistory)
            .filter(SearchHistory.userId == userId)
            .order_by(SearchHistory.count.desc(), SearchHistory.lastUsedAt.desc())
            .distinct()
            .limit(10)
            .all()
        )
        tag_ids = [x.tagId for x in search_history]

        if not tag_ids:
            return jsonify({
                "status": "success",
                "message": "No search history found",
                "data": {"questions": []}
            }), 200

        # Step 2: Get questionIds for those tagIds (distinct)
        question_ids = (
            db.session.query(QuestionTag.questionId)
            .filter(QuestionTag.tagId.in_(tag_ids))
            .distinct()
            .all()
        )
        question_ids = [qid[0] for qid in question_ids]

        # Step 3: Get Questions and order by createdAt
        questions = (
            db.session.query(Question)
            .filter(Question.questionId.in_(question_ids))
            .order_by(Question.createdAt.desc())
            .limit(10)
            .all()
        )

        # Step 4: Add tags
        questions_list = []
        for question in questions:
            question_dict = question.to_dict()
            tags = (
                db.session.query(Tag.label)
                .join(QuestionTag, QuestionTag.tagId == Tag.tagId)
                .filter(QuestionTag.questionId == question.questionId)
                .all()
            )
            tag_labels = [tag.label for tag in tags]
            question_dict['tags'] = tag_labels
            questions_list.append(question_dict)

        return jsonify({
            "status": "success",
            "message": "Search history fetched successfully",
            "data": {"questions": questions_list}
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error fetching search history: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route('/questions/<int:id>', methods=['GET'])
@jwt_required(optional=True)
def getQuestion(id):
    current_app.logger.info(
        "Accessed get question route for questionId: %s", id)
    try:
        userId = get_jwt_identity()
        comments = Comment.query.filter(Comment.questionId == id).all()
        comments_list = [comment.to_dict() for comment in comments]
        if userId:
            # update search history
            for comment in comments_list:
                like = CommentLike.query.filter(
                    CommentLike.commentId == comment.get("id"), CommentLike.userId == userId).first()
                likedByme = 0
                dislikedByme = 0
                if like:
                    if like.value == 1:
                        likedByme = 1
                    else:
                        dislikedByme = 1
                comment["likedByMe"] = likedByme
                comment["dislikedByMe"] = dislikedByme
        tags = (db.session.query(Tag)
                .join(QuestionTag, QuestionTag.tagId == Tag.tagId)
                .filter(QuestionTag.questionId == id)
                .all())

        tag_labels = [tag.label for tag in tags]
        if userId:
            for tag in tags:
                if tag:
                    existing_entry = SearchHistory.query.filter_by(
                        userId=userId, tagId=tag.tagId
                    ).first()
                    if existing_entry:
                        existing_entry.count += 1
                        # lastUsedAt is updated automatically due to onupdate
                    else:
                        new_entry = SearchHistory(
                            userId=userId, tagId=tag.tagId)
                        db.session.add(new_entry)
            db.session.commit()
        question = Question.query.filter(Question.questionId == id).first()
        question_dict = question.to_dict()
        if userId:
            like = QuestionLike.query.filter(
                QuestionLike.questionId == id, QuestionLike.userId == userId).first()
            if like:
                if like.value == 1:
                    question_dict["likedByMe"] = 1
                else:
                    question_dict["dislikedByMe"] = 1
        question_dict["comments"] = comments_list
        question_dict["tags"] = tag_labels
        return jsonify({"status": "success",
                        "message": "Data Fetched Successfully",
                        "data": {"question": question_dict}}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error fetching question: {str(e)}")
        return jsonify({"status": "error", "message": f"Server Error {str(e)}"}), 500


@api.route("/questions/<int:questionId>/toggleLike", methods=["POST"])
@jwt_required()
def likeQuestion(questionId):
    current_app.logger.info(
        "Accessed like Question route for questionId: %s", questionId)
    data = request.json
    userId = get_jwt_identity()
    LIKE = 1
    DISLIKE = -1
    REMOVE_VOTE = 0
    try:
        voteStatus = data.get("voteStatus")
        if voteStatus not in [LIKE, REMOVE_VOTE, DISLIKE]:
            return jsonify({"status": "error", "message": "Invalid vote status"}), 400

        question = Question.query.filter_by(questionId=questionId).first()
        if not question:
            return jsonify({"status": "error", "message": "Question not found"}), 404

        question_like = QuestionLike.query.filter_by(
            userId=userId, questionId=questionId).first()

        if voteStatus in [LIKE, DISLIKE]:
            if question_like:
                question.likesCount += 2 * (voteStatus)
                question_like.value = voteStatus
            else:
                question_like = QuestionLike(
                    userId=userId, questionId=questionId, value=voteStatus)
                question.likesCount += voteStatus
                db.session.add(question_like)
        elif voteStatus == REMOVE_VOTE and question_like:
            question.likesCount -= question_like.value
            db.session.delete(question_like)

        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Like Toggle Successful",
            "data": {
                "questionId": questionId,
                "voteStatus": voteStatus,
                "likesCount": question.likesCount,
            },
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error in Like comment: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


# comment routes
@api.route("/questions/<int:id>/comments", methods=["POST"])
@jwt_required()
def postComment(id):
    current_app.logger.info(
        "Accessed post comment route for questionId: %s", id)
    data = request.json
    try:
        userId = int(get_jwt_identity())
        # Create the comment
        comment = Comment(
            body=data.get("body"),
            userId=userId,
            questionId=id,
            parentId=data.get("parentId")
        )
        db.session.add(comment)
        question = Question.query.filter(Question.questionId == id).first()
        question.latestCommentDate = func.now()  # Update the latest comment date
        # If it's a parent comment, update the question's comment count
        if comment.parentId is None:  # Only increment if it's a parent comment
            if question:
                question.commentsCount += 1
            else:
                return jsonify({"status": "error", "message": "Question not found"}), 404

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Data Entered Successfully",
            "data": {"comments": comment.to_dict()}
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error posting comment: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route("/questions/<int:questionId>/comments/<int:commentId>", methods=["PUT"])
@jwt_required()
def updateComment(questionId, commentId):
    current_app.logger.info(
        "Accessed update comment route for questionId: %s, commentId: %s", questionId, commentId)
    data = request.json
    try:
        comment = Comment.query.filter(
            Comment.commentId == commentId, Comment.questionId == questionId).first()
        if not comment:
            return jsonify({"status": "error", "message": "Comment not found"}), 404
        comment.body = data.get("body")
        question = Question.query.filter(Question.questionId == id).first()
        question.latestCommentDate = func.now()  # Update the latest comment date
        db.session.commit()
        return jsonify({"status": "success",
                        "message": "Data Updated Successfully",
                        "data": {"comments": comment.to_dict()}}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating comment: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route("/questions/<int:questionId>/comments/<int:commentId>", methods=["DELETE"])
@jwt_required()
def deleteComment(questionId, commentId):
    current_app.logger.info(
        "Accessed delete comment route for questionId: %s, commentId: %s", questionId, commentId)

    try:
        comment = Comment.query.filter(
            Comment.commentId == commentId, Comment.questionId == questionId).first()
        if comment:
            comment_dict = comment.to_dict()
            if comment.parentId is None:
                comment.question.commentsCount -= 1
            db.session.delete(comment)
            db.session.commit()
            return jsonify({"status": "success", "message": "Data Deleted Successfully", "data": {"comments": comment_dict}}), 200
        else:
            return jsonify({"status": "error", "message": "Comment not found"}), 404
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting comment: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route("/questions/<int:questionId>/comments/<int:commentId>/toggleLike", methods=["POST"])
@jwt_required()
def likeComment(questionId, commentId):
    current_app.logger.info(
        "Accessed like comment route for questionId:%s, commentId:%s", questionId, commentId
    )
    data = request.json
    userId = get_jwt_identity()

    LIKE = 1
    DISLIKE = -1
    REMOVE_VOTE = 0

    try:
        voteStatus = data.get("voteStatus")
        if voteStatus not in [LIKE, REMOVE_VOTE, DISLIKE]:
            return jsonify({"status": "error", "message": "Invalid vote status"}), 400

        comment = Comment.query.filter_by(
            commentId=commentId, questionId=questionId).first()
        if not comment:
            return jsonify({"status": "error", "message": "Comment not found"}), 404

        comment_like = CommentLike.query.filter_by(
            userId=userId, commentId=commentId).first()

        if voteStatus in [LIKE, DISLIKE]:
            if comment_like:
                comment.likesCount += 2 * (voteStatus)
                comment_like.value = voteStatus
            else:
                comment_like = CommentLike(
                    userId=userId, commentId=commentId, value=voteStatus)
                comment.likesCount += voteStatus
                db.session.add(comment_like)
        elif voteStatus == REMOVE_VOTE and comment_like:
            comment.likesCount -= comment_like.value
            db.session.delete(comment_like)

        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Like Toggle Successful",
            "data": {
                "commentId": commentId,
                "questionId": questionId,
                "voteStatus": voteStatus,
                "likesCount": comment.likesCount,
            },
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error Liking comment: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


# user routes
@api.route("/user/<int:id>/profile", methods=["GET"])
@jwt_required(optional=True)
def getUserDetails(id):
    userId = get_jwt_identity()
    try:
        userprofile = UserProfile.query.filter(
            UserProfile.userId == id).first()
        if userprofile:
            userName = userprofile.user.userName
            user_dict = userprofile.to_dict()
            user_dict["createdAt"] = userprofile.user.createdAt.isoformat()
            user_dict["userName"] = userName[0].upper() + userName[1:]
            user_dict['commentsCount'] = db.session.query(
                Comment).filter_by(userId=id).count()
            if userId == id:
                user_dict["loginByMe"] = True
            else:
                user_dict["loginByMe"] = False
            return jsonify({"status": "success", "data": user_dict, "message": "get User details successful"}), 200
        return jsonify({"status": "error", "message": "user doesn't Exist"}), 404
    except Exception as e:
        current_app.logger.error(
            f"Error in getting User Details: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route("/user/<int:id>/questions", methods=["GET"])
@jwt_required(optional=True)
def getUserQuestions(id):
    userId = get_jwt_identity()
    try:
        questions = Question.query.filter(Question.userId == id).all()
        questions_list = []
        loginByMe = False
        if userId == id:
            loginByMe = True
        if questions:
            for question in questions:
                question_dict = question.to_dict()
                question_dict["loginByMe"] = loginByMe
                questions_list.append(question_dict)
        return jsonify({"status": "success", "data": {"questions": questions_list}, "message": "get User questions successful"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error in getting User Questions: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route("/user/<int:id>/comments", methods=["GET"])
@jwt_required(optional=True)
def getUserComments(id):
    userId = get_jwt_identity()
    try:
        comments = Comment.query.filter(Comment.userId == id).all()
        comments_list = []
        loginByMe = False
        if userId == id:
            loginByMe = True
        if comments:
            for comment in comments:
                comment_dict = comment.to_dict()
                comment_dict["loginByMe"] = loginByMe
                comments_list.append(comment_dict)
        return jsonify({"status": "success", "data": {"comments": comments_list}, "message": "get User comments successful"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error in getting User Comments: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route("/user/<int:id>/votes", methods=["GET"])
@jwt_required(optional=True)
def getUserVotes(id):
    userId = get_jwt_identity()
    try:
        questionsWithLikes = db.session.query(Question.title, QuestionLike).join(
            QuestionLike, QuestionLike.questionId == Question.questionId
        ).filter(QuestionLike.userId == id).all()

        questionsLike_list = []
        loginByMe = False

        if userId == id:
            loginByMe = True

        for question, questionLike in questionsWithLikes:
            questionLike_dict = questionLike.to_dict()
            questionLike_dict["title"] = question
            questionLike_dict["loginByMe"] = loginByMe
            questionsLike_list.append(questionLike_dict)

        return jsonify({
            "status": "success",
            "data": {"votes": questionsLike_list},
            "message": "get User votes successful"
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error in getting User votes: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route("/user/editprofile", methods=["PUT"])
@jwt_required()
def editProfile():
    current_app.logger.info("Accessed edit profile route")
    userId = get_jwt_identity()  # Get the authenticated user ID from the JWT
    try:
        # Retrieve the user
        user = User.query.filter(User.userId == userId).first()

        if not user:
            return jsonify({"status": "error", "message": "User doesn't exist"}), 404

        data = request.json

        # Update user fields
        user.userName = data.get("userName", user.userName)
        # Update the profile fields
        user.profile.location = data.get("location", user.profile.location)
        user.profile.about = data.get("aboutMe", user.profile.about)
        user.profile.github = data.get("github", user.profile.github)
        user.profile.leetcode = data.get("leetcode", user.profile.leetcode)

        db.session.commit()
        current_app.logger.info(
            f"Profile updated successfully for user {userId}")
        return jsonify({"status": "success", "message": "Profile updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error in updating profile: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500


@api.route("/user/deleteprofile", methods=["DELETE"])
@jwt_required()
def deleteProfile():
    current_app.logger.info("Accessed delete profile route")
    userId = get_jwt_identity()
    try:
        userProfile = UserProfile.query.filter(User.userId == userId).first()
        if not userProfile:
            return jsonify({"status": "error", "message": "User doesn't exist"}), 404
        db.session.delete(userProfile)
        user = User.query.filter(User.userId == userId).first()
        user.userName = "user"+str(userId)
        db.session.commit()
        return jsonify({"status": "success", "message": "Profile deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error in deleting profile: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500
