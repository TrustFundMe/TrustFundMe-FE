"use client";

import { useMemo, useState } from "react";

const presetAmounts = [5, 10, 20, 50, 100];

export default function DonateForm({
  onDonate,
}: {
  onDonate: (payload: {
    amount: number;
    firstName: string;
    lastName: string;
    email: string;
    paymentMethod: "test" | "offline" | "card";
  }) => void;
}) {
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "test" | "offline" | "card"
  >("test");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const finalAmount = useMemo(() => {
    const custom = Number(customAmount);
    if (customAmount.trim() && Number.isFinite(custom) && custom > 0) return custom;
    return amount;
  }, [amount, customAmount]);

  return (
    <form
      className="give-form"
      onSubmit={(e) => {
        e.preventDefault();
        onDonate({
          amount: finalAmount,
          firstName,
          lastName,
          email,
          paymentMethod,
        });
      }}
    >
      <div className="donate-amount-buttons give-donation-amount">
        {presetAmounts.map((v) => (
          <span
            key={v}
            role="button"
            tabIndex={0}
            onClick={() => {
              setAmount(v);
              setCustomAmount("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setAmount(v);
                setCustomAmount("");
              }
            }}
            style={{
              border: amount === v && !customAmount ? "2px solid #F84D43" : undefined,
            }}
          >
            {v}
          </span>
        ))}

        <span
          role="button"
          tabIndex={0}
          onClick={() => {
            setCustomAmount("1");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") setCustomAmount("1");
          }}
          style={{
            border: customAmount ? "2px solid #F84D43" : undefined,
          }}
        >
          custom
        </span>
      </div>

      {customAmount ? (
        <div className="give-purchase-form-wrap" style={{ marginTop: 16 }}>
          <div className="row g-4">
            <div className="col-md-12 col-12">
              <div className="single-personal-info">
                <label htmlFor="customAmount">Custom Amount</label>
                <input
                  id="customAmount"
                  type="number"
                  min={1}
                  className="give-input"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="give-payment-mode-select">
        <h3>Select Payment Method</h3>

        <div className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id="method1"
            name="paymentmode"
            className="custom-control-input"
            checked={paymentMethod === "test"}
            onChange={() => setPaymentMethod("test")}
          />
          <label className="custom-control-label" htmlFor="method1">
            Test Donation
          </label>
        </div>

        <div className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id="method2"
            name="paymentmode"
            className="custom-control-input"
            checked={paymentMethod === "offline"}
            onChange={() => setPaymentMethod("offline")}
          />
          <label className="custom-control-label" htmlFor="method2">
            Offline Donation
          </label>
        </div>

        <div className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id="method3"
            name="paymentmode"
            className="custom-control-input"
            checked={paymentMethod === "card"}
            onChange={() => setPaymentMethod("card")}
          />
          <label className="custom-control-label" htmlFor="method3">
            Credit Card
          </label>
        </div>
      </div>

      <div className="give-purchase-form-wrap">
        <div className="row g-4">
          <div className="col-md-6 col-12">
            <div className="single-personal-info">
              <label htmlFor="fname">First Name</label>
              <input
                type="text"
                className="give-input"
                id="fname"
                placeholder="Enter Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 col-12">
            <div className="single-personal-info">
              <label htmlFor="lname">Last Name</label>
              <input
                type="text"
                className="give-input"
                id="lname"
                placeholder="Enter Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-12 col-12">
            <div className="single-personal-info">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                className="give-input"
                id="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-12 col-12">
            <div className="donate-total-amount">
              <div className="give-donation-total-label">Donation Total:</div>
              <div className="give-final-total-amount">
                <span>$</span>
                {finalAmount}
              </div>
              <button type="submit" className="theme-btn mt-4 mt-md-0">
                <i className="far fa-heart" /> Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
