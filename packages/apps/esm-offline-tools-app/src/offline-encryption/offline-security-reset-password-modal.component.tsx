import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TextInput,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@carbon/react";
import styles from "./offline-security-modals.styles.scss";

interface OfflineSecurityOnlineModeModallProps {
  closeModal: Function;
}

const OfflineSecurityOnlineModeModal: React.FC<
  OfflineSecurityOnlineModeModallProps
> = ({ closeModal }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateInput(e);
  };

  const handleSave = (e) => {
    validateInput(e);
    if (error.password || error.confirmPassword) {
      return;
    }
    //handle save
  };

  const validateInput = (e) => {
    let { name, value } = e.target;
    setError((prev) => {
      const stateObj = { ...prev, [name]: "" };
      switch (name) {
        case "password":
          if (!value) {
            stateObj[name] = t("enterPassword", "Please enter a password.");
          } else if (input.confirmPassword && value !== input.confirmPassword) {
            stateObj["confirmPassword"] = t(
              "passwordsDoesNotMatch",
              "Password and confirmation password does not match."
            );
          } else {
            stateObj["confirmPassword"] = input.confirmPassword
              ? ""
              : error.confirmPassword;
          }
          break;

        case "confirmPassword":
          if (!value) {
            stateObj[name] = t(
              "enterConfirmationPassword",
              "Please enter the confirmation password."
            );
          } else if (input.password && value !== input.password) {
            stateObj["confirmPassword"] = t(
              "passwordsDoesNotMatch",
              "Password and confirmation password does not match."
            );
          }
          break;
        default:
          break;
      }
      return stateObj;
    });
  };

  return (
    <>
      <ModalHeader
        className={styles.productiveHeading03}
        closeModal={closeModal}
      >
        {t("offlineSecurity", "Offline Security")}
      </ModalHeader>
      <ModalBody>
        <p className={styles.bodyLong01}>
          {t(
            "enterNewPasswordOfflineMode",
            "Please enter a new password for encryption in offline mode."
          )}
        </p>
        <p className={styles.bodyLong01}>
          {t(
            "offlinePasswordRecomendation",
            "Recommendation: Use your login password for encryption."
          )}
        </p>
        <div className={styles.offlineSecurityInput}>
          <TextInput
            type="password"
            id="password"
            name="password"
            labelText={t("password", "Password")}
            value={input.password}
            onBlur={validateInput}
            onChange={handleInputChange}
            invalid={!!error.password}
            invalidText={error.password}
          />
        </div>
        <div className={styles.offlineSecurityInput}>
          <TextInput
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            labelText={t("reenterPassword", "Re-enter Password")}
            value={input.confirmPassword}
            onBlur={validateInput}
            onChange={handleInputChange}
            invalid={!!error.confirmPassword}
            invalidText={error.confirmPassword}
          />
        </div>

        <p>{t("disclaimer", "Disclaimer")}:</p>
        <p>
          {t(
            "passwordResetDisclaimer",
            "All downloaded and newly recorded patients and data will be deleted on password reset"
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="primary" onClick={handleSave} autoFocus>
          {t("reset", "Reset")}
        </Button>
      </ModalFooter>
    </>
  );
};

export default OfflineSecurityOnlineModeModal;
