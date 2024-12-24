import { getAuth, signInAnonymously, UserCredential } from "firebase/auth";
import { app } from "./app";

const auth = getAuth(app);

let user: UserCredential['user'];
let error = new Error('User not authorized');

export const authenticate = () => signInAnonymously(auth)
.then((certs) => {
  user = certs.user;
  return user;
})
.catch((e) => {
  console.error(e);
  error = e;
});

export const getUser = () =>{
  if (user) {
    return user;
  }

  if (error) {
    console.error(error);
  }

  return null;
}
