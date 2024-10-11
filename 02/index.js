import FormValidation from "./form-validation.js";
import ToastMessage from "../assets/modules/toast.js";
let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);
// where you import the module
// called by only single line
let objectInput = {
    formID: "form-13888",
    showStrength: true,
}
const login = new FormValidation(objectInput, handleData);

function handleData(data){
    $(".container__await").style.setProperty("display", "flex");
    const fetched_data = {
        postName: data["full-name"],
        postDesc: data["email"],
    }
    try {
        fetch("https://rest-api-eta-one.vercel.app/api/posts/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(fetched_data),
        })
        .then ((httpRequest)=>{
            if (httpRequest.ok){
                const toast1 = new ToastMessage({
                    "message": "Created your account successfully",
                    "type": "success"
                });
                toast1.show();
                setTimeout(()=>{window.location.href = "./../"},6000)
            } else {
                throw new Error ("The request cant be handled")
            }
        })
    } catch (error) {
        const toast1 = new ToastMessage({
            "message": "error",
            "type": "error"
        });
        toast1.show();
    }
    
    console.log(data)
}