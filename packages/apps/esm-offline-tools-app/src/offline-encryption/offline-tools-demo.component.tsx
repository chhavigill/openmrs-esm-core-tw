import React, { useCallback } from "react";
import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";

export default function OfflineToolsDemo() {
  const openModal = useCallback((modal) => {
    const dispose = showModal(modal, {
      closeModal: () => dispose(),
    });
  }, []);

  return (
    <div>
      <Button
        size="lg"
        kind="primary"
        onClick={() => openModal("offline-encryption-online-dialog")}
      >
        {"Online mode"}
      </Button>
      <Button
        size="lg"
        kind="primary"
        onClick={() => openModal("offline-encryption-offline-dialog")}
      >
        {"Offline Mode"}
      </Button>
      <Button
        size="lg"
        kind="primary"
        onClick={() => openModal("offline-encryption-reset-password-dialog")}
      >
        {"Reset"}
      </Button>
    </div>
  );
}
