import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const res = await api.get(`/team/invite/${token}`);
        setInviteData(res.data);
      } catch (err) {
        console.error(err);
        alert("Invalid or expired invite!");
      } finally {
        setLoading(false);
      }
    };
    verifyInvite();
  }, [token]);

  const handleAccept = async () => {
    try {
      await api.post(`/team/invite/accept/${token}`);
      alert("🎉 Invite accepted! You are now part of the team.");
      navigate("/team");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to accept invite");
    }
  };

  if (loading) return <div>Loading invite...</div>;
  if (!inviteData) return <div>Invalid invite</div>;

  return (
    <div>
      <h2>Invite from Team</h2>
      <p>Email: {inviteData.email}</p>
      <p>Role: {inviteData.role}</p>
      <button onClick={handleAccept}>Accept Invite</button>
    </div>
  );
};

export default AcceptInvite;
