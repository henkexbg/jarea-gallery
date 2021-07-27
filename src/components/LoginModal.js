import React from 'react';
import { Modal } from '@material-ui/core';

const LoginModal = () => (
<Modal open='true'>
  <div>
    <h2 id="server-modal-title">Server-side modal</h2>
    <p id="server-modal-description">If you disable JavaScript, you will still see me.</p>
  </div>
</Modal>
)

export default LoginModal;