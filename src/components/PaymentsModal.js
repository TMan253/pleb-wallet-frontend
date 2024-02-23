import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import {QRCodeSVG} from "qrcode.react";
import {axiosWithAuth} from "../utils/axiosWithAuth";
import "./PaymentsModal.css";

const customStyles = {
  content: {
    top: "10%",
    left: "40%",
    right: "40%",
    bottom: "auto",
  },
};

const PaymentsModal = ({ modalState, setModalState, user }) => {
  // Our state for the info we will send to either generate a new invoice or pay an invoice
  const [formData, setFormData] = useState({
    amount: 0,
    invoiceToPay: "",
  });
  // Our state for storing the invoice we created to be paid
  const [invoice, setInvoice] = useState("");
  // Our state for the invoice we paid
  const [paymentInfo, setPaymentInfo] = useState({
    paymentHash: "",
    checkingId: "",
  });

  // Error state
  const [error, setError] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleSend = (e) => {
    // Keep the page from refreshing when the form is submitted
    e.preventDefault();

    const data = {
      payment_request: formData.invoiceToPay,
      user_id: user.id,
    };
    axiosWithAuth()
      .post(`${backendUrl}/lightning/pay`, data)
      .then((res) => {
        setPaymentInfo({
          paymentHash: res.data.payment_hash,
          checkingId: res.data.checking_id,
        });
        // Reload the page to update the balance if the pasyment was successful.
        window.location.reload();
      })
      .catch((err) => setError(err.message));

    return;
  };

  const handleReceive = (e) => {
    // Keep the page from refreshing when the form is submitted.
    e.preventDefault();

    const data = {
      value: formData.amount,
      // TODO: Add additional form field for user-specified memo.
      memo: "Demo payment",
      user_id: user.id,
    };
    axiosWithAuth()
      .post(`${backendUrl}/lightning/invoice`, data)
      .then((res) => setInvoice(res.data.payment_request))
      .catch((err) => setError(err.message));

    return;
  };

  // Function to clear all of our state when we close the modal
  const clearForms = () => {
    setModalState({
      type: "",
      open: false,
    });
    setInvoice("");
    setPaymentInfo({
      paymentHash: "",
      checkingId: "",
    });
    setFormData({
      amount: 0,
      invoiceToPay: "",
    });
  };

  return (
    <Modal
      isOpen={modalState.open}
      style={customStyles}
      contentLabel="Payments Modal"
      appElement={document.getElementById("root")}
    >
      <p
        className="close-button"
        onClick={() => {
          clearForms();
        }}
      >
        X
      </p>
      {/* If it is a send */}
      {modalState.type === "send" && (
        <form>
          <label>paste an invoice</label>
          <input
            type="text"
            value={formData.invoiceToPay}
            onChange={(e) =>
              setFormData({ ...formData, invoiceToPay: e.target.value })
            }
          />
          <button className="button" onClick={(e) => handleSend(e)}>
            Submit
          </button>
        </form>
      )}
      {/* If it is a receive */}
      {modalState.type === "receive" && (
        <form>
          <label>enter amount</label>
          <input
            type="number"
            min="0"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
          />
          <button className="button" onClick={(e) => handleReceive(e)}>
            Submit
          </button>
        </form>
      )}
      {/* If we are displaying our newly created invoice */}
      {invoice && (
        <section>
          <h3>Invoice created</h3>
          <p>{invoice}</p>
          <QRCodeSVG size={256} width={"100%"} value={invoice} />
        </section>
      )}
      {/* If we are displaying the status of our successful payment */}
      {paymentInfo.paymentHash && (
        <section>
          <h3>Payment sent</h3>
          <p>Payment hash: {paymentInfo.paymentHash}</p>
          <p>Checking id: {paymentInfo.checkingId}</p>
        </section>
      )}
      {/* If we have encountered an error, display its message text */}
      {error && (
        <section>
          <h3>Error</h3>
          <p>{error}</p>
        </section>
      )}
      </Modal>
  );
};

export default PaymentsModal;
