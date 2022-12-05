(function () {
  const api_url = "http://127.0.0.1:8000/api/v1/";

  function XMLHttpFactories() {
    try {
      return new XMLHttpRequest();
    } catch (_) {
      try {
        return new ActiveXObject("Msxml3.XMLHTTP");
      } catch (_) {
        try {
          return new ActiveXObject("Msxml2.XMLHTTP.6.0");
        } catch (_) {
          try {
            return new ActiveXObject("Msxml2.XMLHTTP.3.0");
          } catch (_) {
            try {
              return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (_) {
              try {
                return new ActiveXObject("Microsoft.XMLHTTP");
              } catch (_) {
                return false;
              }
            }
          }
        }
      }
    }
  }

  function createXMLHTTPObject() {
    var xmlhttp = XMLHttpFactories();
    return xmlhttp;
  }

  function browserSupported() {
    const xmlHttpObj = createXMLHTTPObject();
    return Boolean(xmlHttpObj);
  }

  function makeRequest(url, data, cb, err) {
    url = api_url + url;
    const xmlHttpObj = createXMLHTTPObject();
    xmlHttpObj.addEventListener("load", function () {
      if (xmlHttpObj.readyState === 4 && xmlHttpObj.status === 200) {
        const helper = {};

        helper.json = function () {
          const data = JSON.parse(xmlHttpObj.responseText);

          if (data.error) {
            err && err(data);
          } else {
            return data;
          }
        };

        helper.body = function () {
          return xmlHttpObj.responseText;
        };
        cb && cb(helper);
      }
    });
    xmlHttpObj.addEventListener("error", function (e) {
      err && err(e);
    });
    xmlHttpObj.open("POST", url);
    xmlHttpObj.setRequestHeader("Content-Type", "application/json");
    xmlHttpObj.send(JSON.stringify(data));
  }

  function throwError(msg) {
    throw new Error("CharLando: " + msg);
  }

  class Utils {
    _createElement(type, classes = []) {
      const element = document.createElement(type);
      if (classes.length > 0) {
        element.classList.add("cl");
        classes.forEach((e) => {
          if (e !== "cl") {
            element.classList.add(e);
          }
        });
      }

      return element;
    }
  }

  class Chatbox extends Utils {
    constructor() {
      super();
    }

    set typing(is_typing) {
      const t = this.chatInstance.querySelector(".chatbody .typing");

      if (is_typing) {
        t.classList.add("show");
      } else {
        t.classList.remove("show");
      }
    }

    #onMessageSend(message) {
      this.onsend && this.onsend(message);
    }

    #loadElements(chatInstance) {
      const chatbody = this._createElement("div", ["chatbody"]);
      const header = this._createElement("div", ["header"]);
      const messageBox = this._createElement("form", ["messageBox"]);

      const messageInput = this._createElement("input", ["messageInput"]);
      const messageSendBtn = this._createElement("button", ["messageSendBtn"]);

      messageBox.appendChild(messageInput);
      messageBox.appendChild(messageSendBtn);
      messageInput.placeholder = "Enter message...";

      messageSendBtn.style.backgroundColor = this.theme;
      messageSendBtn.type = "submit";
      messageSendBtn.innerHTML =
        '<span class="opacity"></span><svg xmlns="http://www.w3.org/2000/svg" height="40" width="40"><path d="M5.833 32.083V7.917L34.5 20Zm2.084-3.208L29.083 20 7.917 11.042v6.75L17 20l-9.083 2.167Zm0 0V11.042v11.125Z"/></svg>';

      messageBox.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = messageInput.value;
        if (message.replace(" ", "") === "") {
          return;
        }
        this._pushMessage(message, "self");
      });

      header.style.backgroundColor = this.theme;

      // Header elements
      const title = this._createElement("p", ["title"]);
      const close = this._createElement("button", ["close"]);
      const statusIndicator = this._createElement("div", ["status"]);
      const opacity = this._createElement("div", ["opacity"]);

      const status = this._createElement("span");
      const statusText = this._createElement("p");

      setInterval(function () {
        statusText.innerText = navigator.onLine ? "Online" : "Offline";
        status.classList.remove(navigator.onLine ? "offline" : "online");
        status.classList.add(navigator.onLine ? "online" : "offline");
        if (!navigator.onLine) {
          messageInput.disabled = true;
          messageSendBtn.disabled = true;
        } else {
          messageInput.disabled = false;
          messageSendBtn.disabled = false;
        }
      }, 1);

      statusIndicator.appendChild(status);
      statusIndicator.appendChild(statusText);

      title.innerText = "CharLando";
      close.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';

      const group1 = this._createElement("div", ["group"]);

      group1.appendChild(title);
      group1.appendChild(statusIndicator);

      window.addEventListener("keyup", (e) => {
        if (e.which == 27 || e.code === "Escape") {
          if (
            document.querySelector("button.cl.bubble") &&
            chatInstance.classList.contains("open")
          ) {
            document.querySelector("button.cl.bubble").focus();
          }
          chatInstance.classList.remove("open");
        }
      });

      close.addEventListener("click", () => {
        chatInstance.classList.remove("open");
      });

      header.appendChild(group1);
      header.appendChild(close);
      header.appendChild(opacity);

      const typing = this._createElement("p", ["typing"]);
      typing.innerText = "typing...";
      chatbody.appendChild(typing);

      chatInstance.appendChild(header);
      chatInstance.appendChild(chatbody);
      chatInstance.appendChild(messageBox);
    }

    _pushMessage(message, from) {
      const chatbody = this.chatInstance.querySelector(".chatbody");
      const messageInput = this.chatInstance.querySelector(
        ".messageBox .messageInput"
      );
      const messageElem = this._createElement("div", ["message"]);

      if (from === "bot") {
        messageElem.style.backgroundColor = this.theme;
        const opacity = this._createElement("div", ["opacity"]);
        const span = this._createElement("span", []);

        span.innerText = message;

        messageElem.appendChild(opacity);
        messageElem.appendChild(span);

        messageElem.classList.add("bot");
      } else {
        messageElem.innerText = message;
        messageElem.classList.add("self");
      }
      chatbody.appendChild(messageElem);
      messageInput.value = "";
      chatbody.scrollTo(0, chatbody.scrollHeight);
    }

    #hasElements(instance) {
      const header = instance.querySelector(".header");
      const chatbody = instance.querySelector(".chatbody");
      const messageBox = instance.querySelector(".messageBox");

      return Boolean(header && chatbody && messageBox);
    }

    _renderChat() {
      let chatInstance = document.querySelector(".cl.chatbox");
      if (!chatInstance) {
        chatInstance = this._createElement("div", ["chatbox"]);
        document.querySelector("body").appendChild(chatInstance);
      }

      if (!this.#hasElements(chatInstance)) {
        chatInstance.innerHTML = "";
        this.#loadElements(chatInstance);
      }

      setTimeout(() => {
        document.querySelector(".cl.messageInput").focus();
        chatInstance.classList.add("open");
      });
      this.chatInstance = chatInstance;
    }
  }

  class CharLandoInstance extends Chatbox {
    #hiddenPopupMessages = 0;
    constructor(appKey) {
      super();
      this.appKey = appKey;

      const self = this;

      // makeRequest(
      //   "init",
      //   {
      //     appKey: appKey,
      //   },
      //   (d) => {
      //     const data = d.json();
      //     self.#renderWidget();
      //   },
      //   (e) => {
      //     if (e.error) {
      //       throwError(e.error.msg);
      //     }
      //     throwError(e);
      //   }
      // );
      self.#renderWidget();
    }

    get opened() {
      const chatbox = this.chatInstance?.classList?.contains("open");

      return Boolean(chatbox);
    }

    get theme() {
      // check if site has a theme
      const theme = document.querySelector("meta[name='theme-color']");
      if (theme) {
        return theme.content;
      } else {
        return "#3DB54A";
      }
    }

    #showMessagePopup(message, bubble) {
      const messages = bubble.querySelector(".popups");
      const opacity = this._createElement("div", ["opacity"]);
      const span = this._createElement("span", []);

      const childs = messages.children;
      if (childs.length >= 5) {
        childs[this.#hiddenPopupMessages].classList.remove("show");
        this.#hiddenPopupMessages += 1;
      }

      const messageElem = this._createElement("div", ["messagePopup"]);

      span.innerText = message;

      messageElem.style.backgroundColor = this.theme;

      messageElem.appendChild(opacity);
      messageElem.appendChild(span);

      setTimeout(() => {
        messageElem.classList.add("show");
        messages.scrollTo(0, messages.scrollHeight);
      }, 1);

      messages.appendChild(messageElem);
    }

    #renderWidget() {
      const bubble = this._createElement("button", ["bubble"]);
      const clLogo = this._createElement("span", ["logo"]);
      const messages = this._createElement("div", ["popups"]);
      const opacity = this._createElement("div", ["opacity"]);

      bubble.appendChild(clLogo);
      bubble.appendChild(messages);
      bubble.appendChild(opacity);

      bubble.addEventListener("click", () => {
        this._renderChat();
        messages.querySelectorAll(".messagePopup").forEach((e) => {
          this._pushMessage(e.innerText, "bot");
        });
        messages.innerHTML = "";
      });

      bubble.title = "Click to start chat";

      bubble.style.backgroundColor = this.theme;

      document.querySelector("body").appendChild(bubble);
    }
  }

  window.CharLandoInstance = CharLandoInstance;

  let charlando = {};

  function init(appKey) {
    // check for browser support
    if (browserSupported()) {
      return new CharLandoInstance(appKey);
    } else {
      throwError("Browser not supported");
    }
  }

  charlando.init = init;

  window.charlando = charlando;
})();
