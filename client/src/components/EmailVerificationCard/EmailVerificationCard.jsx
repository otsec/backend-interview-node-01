import React from 'react';

export function EmailVerificationCard({verification, showDetails}) {
  const onEmailClick = (e) => {
      e.preventDefault()

      showDetails(verification.id)
  }

  return (
    <div>
        <h5>
            <a href="#" onClick={e => onEmailClick(e)}>{verification.email}</a>
        </h5>
        <hr/>
        <div>
            <p>Date: <b>{verification.created_at}</b></p>
            <p><b>{verification.result}</b></p>
        </div>
    </div>
  );
}
