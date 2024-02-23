import React, { useState } from "react";
import PaymentsModal from "./PaymentsModal";
import "./Buttons.css";

export const Buttons = ({ isLoggedIn, user }) => {
  const [modalState, setModalState] = useState({
    type: "",
    open: false,
  });

  return (
    <div>
      <div className="buttons">
        <button
          className="button"
          onClick={() => setModalState({ type: "send", open: true })}
          disabled={!isLoggedIn}
        >
          Send
        </button>
        <button
          className="button"
          onClick={() => setModalState({ type: "receive", open: true })}
          disabled={!isLoggedIn}
        >
          Receive
        </button>
      </div>
      {!isLoggedIn && (
        <p className="login-message">
          Login to create invoices or Login as an admin to pay invoices
        </p>
      )}
      <PaymentsModal
        modalState={modalState}
        setModalState={setModalState}
        user={user}
      />
    </div>
  );
};

export default Buttons;
