from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from datetime import datetime
import os
from dotenv import load_dotenv

db = SQLAlchemy()
load_dotenv()

# Loading environment variables
try:
    userNameLength = int(os.getenv("user_name", 50))
    emailLength = int(os.getenv("email", 100))
    passwordLength = int(os.getenv("password", 128))
    titleLength = int(os.getenv("title", 255))
    bodyLength = int(os.getenv("body", 1000))
    tagsLength = int(os.getenv("tags", 100))
    labelLength = int(os.getenv("label", 25))
    aboutLength = int(os.getenv("about", 500))
    linkLength = int(os.getenv("link", 255))
    locationLength = int(os.getenv("location", 100))
except ValueError as e:
    raise ValueError(
        "Environment variables for lengths must be integers.") from e


class User(db.Model):
    __tablename__ = "user"
    userId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userName = db.Column(db.String(userNameLength), nullable=False)
    email = db.Column(db.String(emailLength), unique=True, nullable=False)
    password = db.Column(db.String(passwordLength), nullable=False)
    createdAt = db.Column(db.DateTime, default=func.now())
    updatedAt = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    questions = db.relationship(
        "Question", backref="user", lazy=True, cascade="all,delete-orphan"
    )
    comments = db.relationship(
        "Comment", backref="user", lazy=True, cascade="all,delete-orphan"
    )
    questionlikes = db.relationship(
        "QuestionLike", backref="user", lazy=True, cascade="all,delete-orphan")
    commentlikes = db.relationship(
        "CommentLike", backref="user", lazy=True, cascade="all,delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.userName}>"

    def to_dict(self):
        return {
            "userName": self.userName[0].upper() + self.userName[1:],
            "userId": self.userId,
            "email": self.email,
            "createdAt": self.createdAt,
            "loginByMe": False,
        }


class UserProfile(db.Model):
    __tablename__ = "userprofile"
    userId = db.Column(db.Integer, db.ForeignKey(
        "user.userId", ondelete="CASCADE"), primary_key=True)
    dob = db.Column(db.Date, nullable=True)
    location = db.Column(db.String(locationLength), nullable=True)
    about = db.Column(db.String(aboutLength), nullable=True)
    github = db.Column(db.String(linkLength), nullable=True)
    leetcode = db.Column(db.String(linkLength), nullable=True)
    questionsCount = db.Column(db.Integer, default=0)
    updatedAt = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    user = db.relationship("User", backref=db.backref(
        "profile", uselist=False), lazy=True)

    def __repr__(self):
        return f"<UserProfile {self.userId}>"

    def to_dict(self):
        return {
            "userId": self.userId,
            "aboutMe": self.about,
            "github": self.github,
            "leetcode": self.leetcode,
            "location": self.location,
            "questionsCount": self.questionsCount,
            "commentsCount": 0,
        }


class Question(db.Model):
    __tablename__ = "question"
    questionId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(titleLength), nullable=False)
    body = db.Column(db.String(bodyLength), nullable=False)
    createdAt = db.Column(db.DateTime, default=func.now())
    updatedAt = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
    likesCount = db.Column(db.Integer, default=0)
    viewsCount = db.Column(db.Integer, default=0)
    commentsCount = db.Column(db.Integer, default=0)
    latestCommentDate = db.Column(db.DateTime)
    likes = db.relationship(
        "QuestionLike", backref="question", lazy=True, cascade="all,delete-orphan"
    )
    userId = db.Column(
        db.Integer, db.ForeignKey("user.userId", ondelete="CASCADE"), nullable=False
    )
    comments = db.relationship(
        "Comment", backref="question", lazy=True, cascade="all,delete-orphan"
    )

    def __repr__(self):
        return f"<Question {self.title}>"

    def to_dict(self):
        return {
            "questionId": self.questionId,
            "title": self.title,
            "body": self.body,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
            "updatedAt": self.updatedAt.isoformat() if self.updatedAt else None,
            "likesCount": self.likesCount,
            "viewsCount": self.viewsCount,
            "likedByMe": False,
            "dislikedByMe": False,
            "userId": self.userId,
            "userName": self.user.userName[0].upper() + self.user.userName[1:],
        }


class Tag(db.Model):
    __tablename__ = "tag"
    tagId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    label = db.Column(db.String(labelLength), unique=True, nullable=False)

    def __repr__(self):
        return f"<label {self.label}>"


class QuestionTag(db.Model):
    __tablename__ = "questiontag"
    questionId = db.Column(
        db.Integer, db.ForeignKey("question.questionId", ondelete="CASCADE"), nullable=False)
    tagId = db.Column(
        db.Integer, db.ForeignKey("tag.tagId", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        db.PrimaryKeyConstraint('questionId', 'tagId',
                                name='_question_tag_pk'),
    )

    def __repr__(self):
        return f"<Question {self.questionId} tag:{self.tagId}>"


class Comment(db.Model):
    __tablename__ = "comment"
    commentId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    # Replace bodyLength with 255 or your desired max length
    body = db.Column(db.String(255), nullable=False)
    createdAt = db.Column(db.DateTime, default=func.now())
    updatedAt = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
    likesCount = db.Column(db.Integer, default=0)
    numOfReplies = db.Column(db.Integer, default=0)
    parentId = db.Column(
        db.Integer,
        db.ForeignKey("comment.commentId", ondelete="CASCADE"),
        nullable=True,
    )
    questionId = db.Column(
        db.Integer,
        db.ForeignKey("question.questionId", ondelete="CASCADE"),
        nullable=False,
    )
    userId = db.Column(
        db.Integer, db.ForeignKey("user.userId", ondelete="CASCADE"), nullable=False
    )

    childComments = db.relationship(
        "Comment",
        backref=db.backref("parentComment", remote_side=[commentId]),
        lazy=True,
        cascade="all,delete-orphan"
    )

    likes = db.relationship(
        "CommentLike", backref="comment", lazy=True, cascade="all,delete-orphan"
    )

    def __repr__(self):
        return f"<Comment {self.commentId}>"

    def to_dict(self):
        userName = self.user.userName if self.user else None
        return {
            "id": self.commentId,
            "numOfReplies": self.numOfReplies,
            "body": self.body,
            "likesCount": self.likesCount,
            "likedByMe": False,
            "dislikedByMe": False,
            "user": {
                "id": self.userId,
                "name": userName[0].upper() + userName[1:],
            },
            "parentId": self.parentId,
            "questionId": self.questionId,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
            "updatedAt": self.updatedAt.isoformat() if self.updatedAt else None,
        }


class CommentLike(db.Model):
    __tablename__ = "commentlike"

    userId = db.Column(db.Integer, db.ForeignKey(
        "user.userId", ondelete="CASCADE"), primary_key=True)
    commentId = db.Column(db.Integer, db.ForeignKey(
        "comment.commentId", ondelete="CASCADE"), primary_key=True)
    value = db.Column(db.Integer, nullable=False)
    createdAt = db.Column(db.DateTime, default=func.now())

    def __repr__(self):
        return f"<CommentLike userId={self.userId} commentId={self.commentId}>"

    def to_dict(self):
        return {
            "userId": self.userId,
            "value": self.value,
            "commentId": self.questionId
        }


class QuestionLike(db.Model):
    __tablename__ = "questionlike"

    userId = db.Column(db.Integer, db.ForeignKey(
        "user.userId", ondelete="CASCADE"), primary_key=True)
    questionId = db.Column(db.Integer, db.ForeignKey(
        "question.questionId", ondelete="CASCADE"), primary_key=True)
    value = db.Column(db.Integer, nullable=False)
    createdAt = db.Column(db.DateTime, default=func.now())

    def __repr__(self):
        return f"<QuestionLike userId={self.userId} questionId={self.questionId}>"

    def to_dict(self):
        return {
            "userId": self.userId,
            "value": self.value,
            "questionId": self.questionId
        }


class SearchHistory(db.Model):
    __tablename__ = "searchhistory"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userId = db.Column(db.Integer, db.ForeignKey(
        "user.userId", ondelete="CASCADE"), nullable=False)
    tagId = db.Column(
        db.Integer, db.ForeignKey("tag.tagId", ondelete="CASCADE"), nullable=False)
    count = db.Column(db.Integer, default=1)
    tags = db.relationship("Tag", backref="searchHistory", lazy=True)
    lastUsedAt = db.Column(
        db.DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<SearchHistory {self.tags}>"

    def to_dict(self):
        return {
            "userId": self.userId,
            "tagId": self.tagId,
            "count": self.count,
            "lastUsedAt": self.lastUsedAt.isoformat() if self.lastUsedAt else None,
        }
