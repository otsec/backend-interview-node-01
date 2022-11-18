import { useState, useEffect } from 'react';
import {AddVerification, EmailVerificationCard, EmailVerificationDetails} from "../."

export function EmailVerificationHistory () {
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [emailVerifications, setEmailVerifications] = useState([]);
  const [emailVerification, setEmailVerification] = useState({});

  const fetchEmailVerifications = () => {
      fetch(`http://localhost:8000/email-verifications`)
          .then((response) => response.json())
          .then((json) => {
              setEmailVerifications(json)
              setIsLoading(false)
          })
          .catch((error) => console.log(error));
  }


  const addEmailVerification = ({email}) => {
      setIsLoading(true)
      setIsAddOpen(false)
      fetch(
          `http://localhost:8000/email-verification`,
          {
              method: 'post',
              body: JSON.stringify({email}),
              headers: {'Content-Type': 'application/json'}
          }
     )
      .then((response) => response.json())
      .then((json) => {
          fetchEmailVerifications()
      })
      .catch((error) => console.log(error));
  }

  const showDetailsModal = (verificationId) => {
      setIsDetailsOpen(true)
      setEmailVerification(
          emailVerifications.filter(emailVerification => emailVerification.id === verificationId)[0]
      )
  }

  useEffect(() => {
      fetchEmailVerifications()
  }, []);

  if (isLoading) {
      return '<div>loading...</div>'
  }

  return (
    <div>
        <div>
            <h1>Email Verification History</h1>
            <button onClick={() => {setIsAddOpen(true)}}>Verify Email</button>
        </div>

        <AddVerification isOpen={isAddOpen} addEmailVerification={addEmailVerification} />
        <EmailVerificationDetails isOpen={isDetailsOpen} emailVerification={emailVerification} closeDetails={() => {setIsDetailsOpen(false)}} />

        <div>
        {
            emailVerifications.length ?
                emailVerifications.map(
                    (emailVerification) =>
                    <EmailVerificationCard key={emailVerification.id} verification={emailVerification} showDetails={showDetailsModal}/>
                ) :
                <button>Verify Email</button>
        }
        </div>
    </div>
  );
}
