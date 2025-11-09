import React, { useEffect, useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import TextEditor from "../texteditor";
import { useAsyncFn } from "../../hooks/useAsync";
import { editProfile } from "../../services/user";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/userContext";
import "../../styles/Settings.css";

function EditProfile({ userDetails }) {
  const navigate = useNavigate();
  const {
    userDetails: { accessToken },
  } = useUserContext();
  const { loading, error, execute } = useAsyncFn(editProfile);
  const [profile, setProfile] = useState({
    userName: "",
    location: "",
    aboutMe: "",
    leetcodeLink: "",
    githubLink: "",
  });
  useEffect(() => {
    setProfile({
      userName: userDetails?.userName || "",
      location: userDetails?.location || "",
      aboutMe: userDetails?.aboutMe || "",
      leetcodeLink: userDetails?.leetcode || "",
      githubLink: userDetails?.github || "",
    });
  }, [userDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleAboutMe = (value) => {
    // console.log(value);
    setProfile((prev) => {
      return {
        ...prev,
        aboutMe: value,
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    execute(profile, accessToken).then(() => {
      if (error === undefined || error === null) {
        navigate(`/u/${userDetails.userId}`);
      }
    });
  };

  return (
    <div className="settings-container">
      <Card className="p-4 mt-3 shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3 fw-bold">Edit Your Profile</Card.Title>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form>
            <Form.Group controlId="displayName" className="mb-3">
              <Form.Label className="fw-bold">User Name</Form.Label>
              <Form.Control
                type="text"
                className="w-50"
                name="userName"
                value={profile.userName}
                onChange={handleChange}
                placeholder="Enter your User name"
                required
              />
            </Form.Group>

            <Form.Group controlId="location" className="mb-3">
              <Form.Label className="fw-bold">Location</Form.Label>
              <Form.Control
                type="text"
                className="w-50"
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="Enter your location"
              />
            </Form.Group>

            <Form.Group controlId="aboutMe" className="mb-3">
              <Form.Label className="fw-bold">About Me</Form.Label>
              <TextEditor value={profile.aboutMe} setValue={handleAboutMe} />
            </Form.Group>

            <div className="d-flex flex-column ">
              <label className="fw-bold m-1 form-label">Links</label>
              <div className="d-flex flex-row border p-2 rounded-2">
                <Form.Group controlId="leetcodeLink" className="w-50 me-2">
                  <Form.Label className="fw-bold">
                    leetcode Link (or username)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="LeetcodeLink"
                    value={profile.leetcodeLink}
                    onChange={handleChange}
                    placeholder="Enter your Leetcode link or username"
                  />
                </Form.Group>

                <Form.Group controlId="githubLink" className="w-50">
                  <Form.Label className="fw-bold">
                    GitHub Link (or username)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="githubLink"
                    value={profile.githubLink}
                    onChange={handleChange}
                    placeholder="Enter your GitHub link or username"
                  />
                </Form.Group>
              </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="primary"
                onClick={(e) => handleSave(e)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default EditProfile;
