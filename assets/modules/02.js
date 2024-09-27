import ToastMessage from "./toast.js";
const data = {
    success: {
        type: "success",
        message: "Your information has been recorded",
    },
    offline: {
        type: "error",
        message: "You have lost connection to the internet.",
    },
}

export default class Users {
    constructor () {
        this.run();
    }

    run() {
        const toast = new ToastMessage(data.success);
        toast.show();
    }
}