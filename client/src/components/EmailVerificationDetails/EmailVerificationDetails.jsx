
import styles from '../../styles.module.css';

export function EmailVerificationDetails({isOpen, emailVerification, closeDetails}) {
    if (!isOpen) {
        return <div></div>
    }

    return (
        <div className={ styles.modal }>
            <div>
                <label>Email Verification result for {emailVerification.email}</label>
            </div>
            <div>
                <b>Date:</b> {emailVerification.created_at}
            </div>
            <div>
                <b>Last verified at:</b> {emailVerification.last_verified_at}
            </div>

            <table>
                <tr>
                    <th>Property</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td>Private</td>
                    <td>yes</td>
                </tr>
            </table>

            <div>
                <button onClick={closeDetails}>Close</button>
            </div>

        </div>
    )
}
