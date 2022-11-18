import {useState} from 'react';

import styles from '../../styles.module.css';

export function AddVerification({isOpen, addEmailVerification}) {
    const [email, setEmail] = useState();

    const handleSubmit = (e) => {
        e.preventDefault()
        addEmailVerification({email})
    }

    if (!isOpen) {
        return <div></div>
    }

    return (
        <div className={ styles.modal }>
            <form onSubmit={e => { handleSubmit(e)}}>
                <div>
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                </div>

                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>

        </div>
    )
}
