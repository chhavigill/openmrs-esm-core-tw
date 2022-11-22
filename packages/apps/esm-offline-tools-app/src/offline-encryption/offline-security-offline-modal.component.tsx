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
import { isPasswordCorrect } from "@openmrs/esm-offline/src/encryption";
import { deleteAllSynchronizationItems, messageOmrsServiceWorker } from "@openmrs/esm-offline";

interface OfflineSecurityOnlineModeModallProps {
  closeModal: Function;
}

const OfflineSecurityOnlineModeModal: React.FC<
  OfflineSecurityOnlineModeModallProps
> = ({ closeModal }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleInputChange = async (e) => {
    const { value } = e.target;
    setInput(value);
    setError(await isPasswordCorrect(value));
  };

  const handleSave = (e) => {
    setError(true);
  };

  const handleForgotPassword = async(e) => {
    await messageOmrsServiceWorker({
      type: "clearCachedEncryptedData"
    });
    deleteAllSynchronizationItems();
    close();
  };

  return (
    <>
      <ModalHeader className={styles.offlineSecurityHeader}>
        {t("offlineSecurity", "Offline Security")}
      </ModalHeader>
      <ModalBody>
        <p className={styles.bodyLong01}>
          {t(
            "enterPasswordOfflineMode",
            "Please enter a password for encryption in offline mode."
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
            value={input}
            onChange={handleInputChange}
            invalidText={t(
              "incorrectPassword",
              "Password entered is incorrect"
            )}
            invalid={error}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="secondary" onClick={handleForgotPassword}>
          {t("forgotPassword", "Forgot Password")}
        </Button>
        <Button size="lg" kind="primary" onClick={handleSave} autoFocus>
          {t("continue", "Continue")}
        </Button>
      </ModalFooter>
    </>
  );
};

export default OfflineSecurityOnlineModeModal;
