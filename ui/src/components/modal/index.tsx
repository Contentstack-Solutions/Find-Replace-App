import React, { useEffect, useState } from "react"
import { Button, ButtonGroup, ModalBody, ModalFooter, ModalHeader } from "@contentstack/venus-components";

const ReplaceModal: React.FC<any> = function (props: any) {
  const [loading, setLodaing] = useState(false);


  return <>
    <ModalHeader title='Replace Entry Value' closeModal={props.closeModal} />

    <ModalBody className='modalBodyCustomClass'>
      <p>Are you sure you want to replace <b>"{props?.selectedUids?.length ?? 0}"</b> fields?</p>
    </ModalBody>

    <ModalFooter>
      <ButtonGroup>
        <Button buttonType='light' onClick={() => props.closeModal()} >
          Cancel
        </Button>
        <Button
          onClick={() => {
            props.handleReplaceClick(props)
            setLodaing(true);
          }}
          buttonType="primary"
          iconAlignment="left"
          icon="TransferOwnersh"
          isLoading={loading}
        >
          Replace
        </Button>
      </ButtonGroup>
    </ModalFooter>
  </>;
}






export default ReplaceModal;