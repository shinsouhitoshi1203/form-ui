let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);
export default class ToastMessage {
    #rnd() {
        let n = 0, _id="";
        function rndNum(s,e) {
            return Math.trunc(Math.random() * (e-s+1) + s);
        }
        function rndChar(s,e) {
            let char = '', n = rndNum(s,e);
            char = String.fromCharCode(n);
            return char;
        }
        for (let i = 1; i<=8;++i) {
            n = rndNum(0,2) ;
            if (n==0) {
                _id+=rndChar(65,90);
            } else if (n==1) {
                _id+=rndChar(97,122);
            } else {
                _id+=rndChar(48,57);
            }
        }
        return _id;
    }
    #icons = {
        success: "fa-solid fa-circle-check fa-lg",
        error: "fa-solid fa-circle-xmark fz-lg",
    };
    #colors = {
        success: "#3d7022",
        error: "#ff0000",
    }
    constructor (objInput = {}) {
        if (true) {
            this.message = objInput.message;
            this.type = objInput.type;
            this.color = this.#colors[this.type];
            this.icon = this.#icons[this.type];
            this.id = this.#rnd();
        } else {
            throw new Error ("The toast message can't be empty")
        }
    }
    #handleEvent(action="") {
        let __id = this.id, nodeMap = [], prevToastIndex = 0;
        function mapToastAfter(_id) {
            let isAllowToPush = false;
            const Toasts = $$(`.toast`);
            Toasts.forEach((e,i)=>{
                console.log(e.classList);
                if (e.getAttribute("data-id")==_id) {
                    isAllowToPush = true;
                    prevToastIndex = i-1;
                } else {
                    if (isAllowToPush) nodeMap.push(e);
                }
            });
            return [prevToastIndex,nodeMap];
        }
        function updateToasts([prevToastIndex,nodeMap]) {
            if (!$('.toast')) return true;
            if (prevToastIndex==-1) {
                $('.toast').style.setProperty("--toast-y", "20px");
                console.log(nodeMap);
                nodeMap.forEach(
                    (e,i)=> {
                        console.log(e.getAttribute("data-id"));
                        if (i!=0){
                            let posY = (0 + 20) + (52 + 20) * i ; /// prev: default + loops ...
                            e.style.setProperty("--toast-y", posY+"px");
                        }
                    }
                )
            } else {
                 // including its height
                nodeMap.forEach(
                    (e,i)=> {
                        let prevToast = $$('.toast')[prevToastIndex], prevTop = prevToast.offsetTop + 52;
                        let posY = prevTop + (52 + 20)*(i) +20;
                        e.style.setProperty("--toast-y", posY+"px");
                    }
                )
            }
            
        }
        function closeToast(_id) {

            let deleteToast = $(`.toast[data-id="${_id}"]`);
            // map items that after the incoming-delete toast
            let dataRetrieve = mapToastAfter(_id);
            // delete the item
            deleteToast.remove();
            // update the items after the deleted item.
            updateToasts(dataRetrieve);
            
        }
        // onclick to close
        $(`.toast[data-id="${__id}"] .toast__close`).addEventListener("click", ()=>closeToast(__id))
        // automatically close after 5 seconds
        if (action=="close") {
            closeToast(__id);
        }
    }
    #render() {
        let __id = this.id;
        let Toasts = $$(".toast");
        let n = Toasts.length;
        // default position when there isnt any toasts
        let posY = 20 + "px";
        if (n>0) {
            let prev = $$(".toast")[n-1], prevPosY = prev.offsetTop;
            // default toast's height is 52px
            posY = prevPosY + 52 + 20 + "px";
        }
        /// render text
        const htmls = 
        `
        <div class="toast" data-id="${this.id}" style="--toast-color: ${this.color}; --toast-y: ${posY}">
            <div class="toast__inner">
                <div class="toast__icon">
                    <i class="${this.icon}"></i>
                </div>
                <p class="toast__message">${this.message}</p>
                <button title="close" class="toast__close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="toast__bar">
                <div class="toast__progress"></div>
            </div>
        </div>
        `;

        $('.toast__container').insertAdjacentHTML("beforeEnd", htmls);
        const progressBar = $(`.toast[data-id="${__id}"] .toast__progress`).animate(
            [
                {transform: `scaleX(0)`}, {transform: `scaleX(100%)`}
            ],
            {
                duration: 5000,
                iteration: 1,
                easing: "linear",
            }
        );
        progressBar.play();
        progressBar.onfinish = ()=>this.#handleEvent("close");        
    }

    show() {
        this.#render();
        this.#handleEvent();
    }
}