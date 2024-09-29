import FormValidation from "./form-validation.js";

// called by only single line
let objectInput = {
    formID: "form-13888",
    showStrength: true,
}
const login = new FormValidation(objectInput);
console.log (login.export());