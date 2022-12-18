(function () {
  const api_url = "http://127.0.0.1:8000/bot/v1/";

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

  function injectDataInURL(url, data) {
    let final = url;
    let dataKeys = Object.keys(data);
    for (let i = 0; i < dataKeys.length; i++) {
      const key = dataKeys[i];
      final = final.replace(new RegExp("{" + key + "}", "g"), data[key]);
    }
    return final;
  }

  function getValueUsingPath(data, path) {
    let final = data;

    path = path.split(".");

    let pathLength = path.length;

    for (let i = 0; i < pathLength; i++) {
      const e = path[i];
      if (final[e]) {
        final = final[e];
      } else {
        final = undefined;
        break;
      }
    }

    return final;
  }

  let initialData = undefined;

  function createXMLHTTPObject() {
    var xmlhttp = XMLHttpFactories();
    return xmlhttp;
  }

  function browserSupported() {
    const xmlHttpObj = createXMLHTTPObject();
    return Boolean(xmlHttpObj);
  }

  function makeRequest(url, data, cb, err, external = false) {
    if (!external) {
      url = api_url + url;
    }
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
    xmlHttpObj.open(!external ? "POST" : "GET", url);
    xmlHttpObj.setRequestHeader("Content-Type", "application/json");
    xmlHttpObj.addEventListener("loadend", function () {
      if (xmlHttpObj.status !== 200) {
        if (xmlHttpObj.status === 0) {
          const status = document.querySelector(".cl.status");
          if (status) {
            status.querySelector("span").classList.remove("online");
            status.querySelector("span").classList.add("offline");

            status.querySelector("p").innerText = "Offline";
          }
        }
        err &
          err({
            status: xmlHttpObj.status,
            url: url,
          });
      }
    });
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

      this._returnResponse = false;
      this._response = null;
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
      this._onsend && this._onsend(message);
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

      status.classList.add("online");
      statusText.innerText = "Online";

      setInterval(function () {
        if (navigator.onLine) {
          status.classList.remove("offline");
          status.classList.add("online");
          statusText.innerText = "Online";
        }
        if (status.classList.contains("offline")) {
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

    _renderWebView(data) {
      const { site_name: title, description, url, image } = data;
      const chatbody = this.chatInstance.querySelector(".chatbody");

      const messageElem = this._createElement("a", ["message", "webview"]);

      if (title) {
        const web_title = this._createElement("h3", ["title"]);
        web_title.innerText = title;
        messageElem.appendChild(web_title);
      }

      if (description && title) {
        const web_desc = this._createElement("p", ["description"]);
        web_desc.innerText = description;
        messageElem.appendChild(web_desc);
      }

      if (image && title) {
        const web_img = this._createElement("div", ["image"]);
        web_img.style.backgroundImage = "url(" + image + ")";
        messageElem.appendChild(web_img);
      }
      const web_url = this._createElement("a", ["url"]);

      web_url.href = url;
      web_url.innerText = url;
      web_url.target = "_blank";

      messageElem.appendChild(web_url);

      messageElem.href = url;
      messageElem.target = "_blank";

      chatbody.append(messageElem);

      chatbody.scrollTo(0, chatbody.scrollHeight);
    }

    _pushMessage(message, from, returnResponse = false) {
      const chatbody = this.chatInstance.querySelector(".chatbody");
      const messageInput = this.chatInstance.querySelector(
        ".messageBox .messageInput"
      );
      const messageElem = this._createElement("div", ["message"]);
      if (from === "bot") {
        this._returnResponse = returnResponse;
        this._response = null;
        messageElem.style.backgroundColor = this.theme;
        const opacity = this._createElement("div", ["opacity"]);
        const span = this._createElement("span", []);

        span.innerText = message;

        messageElem.appendChild(opacity);
        messageElem.appendChild(span);

        messageElem.classList.add("bot");
      } else {
        if (this._returnResponse === false) {
          this._response = null;
        }
        messageElem.innerText = message;
        messageElem.classList.add("self");
        if (this._returnResponse && from !== "bot") {
          this._returnResponse = false;
          this._response = message;
        }
        this.#onMessageSend(message);
      }
      chatbody.appendChild(messageElem);

      if (messageElem.innerText === messageInput.value) {
        messageInput.value = "";
      }
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
    #sendMessageTimeout = null;

    constructor(appKey) {
      super();
      this.appKey = appKey;
      this.userActivityTimeout = null;
      this.initialPromptShown = false;

      this.netErrorMessage = "Unable to get data, make sure you are online.";
      const self = this;

      makeRequest(
        "init",
        {
          appKey: appKey,
        },
        (d) => {
          const data = d.json();
          self.#renderWidget();
          initialData = data.success.data;

          self.fallback = data.success.data.fallback.value;

          function resetUserActivityTimeout() {
            self.#resetUserActivityTimeout();
          }

          window.addEventListener("mousemove", resetUserActivityTimeout);
          window.addEventListener("scroll", resetUserActivityTimeout);
          window.addEventListener("keydown", resetUserActivityTimeout);
          window.addEventListener("resize", resetUserActivityTimeout);
        },
        (e) => {
          if (e.error) {
            throwError(e.error.msg);
          }
          throwError(e);
        }
      );
    }

    #handleDynamicResponse(response, haveUnknownValue = false) {
      const self = this;
      let knownValues = {};
      let unknownValues = [];

      if (!haveUnknownValue) {
        // check if bot finds out value for any variable
        Object.keys(response.prompts).forEach((e) => {
          e = e.replace(/\{|\}/g, "");
          if (response.variables[e]) {
            knownValues[e] = response.variables[e];
          } else {
            unknownValues.push(e);
          }
        });
      } else {
        knownValues = self._data.knownValues;
        unknownValues = self._data.unknownValues;

        knownValues[unknownValues[0]] = response;

        unknownValues = unknownValues.slice(1);
      }

      if (unknownValues.length > 0) {
        // Ask from user for the unknown values
        const message = response.prompts["{" + unknownValues[0] + "}"];
        self._pushMessage(message, "bot", true);
      }

      if (!haveUnknownValue) {
        self._data = {
          knownValues,
          unknownValues,
          path: response.response.extras.path,
          resp: response.response.extras.response,
          endpoint: response.response.value,
        };
      } else {
        self._data = {
          ...self._data,
          knownValues,
          unknownValues,
        };
      }

      // Make request to the endpoint
      if (unknownValues.length === 0) {
        self.typing = true;
        const url = self._data.endpoint;
        const endpoint = injectDataInURL(url, knownValues);
        const path = self._data.path;
        const resp = self._data.resp;
        self._data = undefined;

        makeRequest(
          endpoint,
          {},
          (c) => {
            self.typing = false;
            const data = c.json();
            let msg = getValueUsingPath(data, path);

            msg = injectDataInURL(resp, {
              response: msg,
            });

            self._pushMessage(msg, "bot");
          },
          (e) => {
            self.typing = false;
            self._pushMessage(self.netErrorMessage, "bot");
          },
          true
        );
      }
    }

    _getResponse(message) {
      const self = this;
      if (self._response) {
        self.#handleDynamicResponse(self._response, true);
        return;
      }
      makeRequest(
        "chat",
        {
          appKey: this.appKey,
          query: message,
        },
        (d) => {
          const data = d.json();
          const type = data.success.data.response.type;

          if (type === "static") {
            self._pushMessage(data.success.data.response.value, "bot");
          }

          if (type === "dynamic") {
            self.#handleDynamicResponse(data.success.data);
          }

          if (type === "embed") {
            self._renderWebView(data.success.data.response.extras);
          }
          self.typing = false;
        },
        (e) => {
          self.typing = false;
          self._pushMessage(self.netErrorMessage, "bot");
        }
      );
    }

    _onsend(message) {
      const self = this;
      clearTimeout(this.#sendMessageTimeout);
      if (!self._pendingMessages) {
        self._pendingMessages = [];
      }
      if (!self._response) {
        self._pendingMessages.push(message);
        self.typing = true;
        self.#sendMessageTimeout = setTimeout(() => {
          self._getResponse &&
            self._getResponse(this._pendingMessages.join(" "));
          self._pendingMessages = [];
        }, 1500);
      } else {
        self._getResponse(self._response);
      }
    }

    #resetUserActivityTimeout() {
      const self = this;
      const initialPromptShown = this.initialPromptShown;
      const showMessagePopup = this._showMessagePopup;
      function showInitialPrompt() {
        if (initialPromptShown) {
          return;
        }
        const bubble = document.querySelector(".cl.bubble");
        if (initialData && !self.opened) {
          showMessagePopup.call(self, initialData.response.value, bubble);
          self.initialPromptShown = true;
        }
      }

      clearTimeout(this.userActivityTimeout);
      if (!initialPromptShown) {
        self.userActivityTimeout = setTimeout(() => {
          showInitialPrompt();
        }, 2500);
      }
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

    _showMessagePopup(message, bubble) {
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
