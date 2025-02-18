// Select DOM elements to work with
let welcomeDiv = document.getElementById("WelcomeMessage");
let signInButton = document.getElementById("SignIn");
let cardDiv = document.getElementById("card-div");
let mailButton = document.getElementById("readMail");
let profileButton = document.getElementById("seeProfile");
let profileDiv = document.getElementById("profile-div");
let authHeader = document.getElementById("authHeader");

function showWelcomeMessage(account) {
    // Reconfiguring DOM elements

    welcomeDiv.innerHTML = `Welcome ${account.name}`;
    signInButton.style.display = 'none';
}

function updateUI(data, endpoint) {
    console.log('Graph API responded at: ' + new Date().toString());
    if (endpoint === graphConfig.graphMeEndpoint) {
        const title = document.createElement('p');
        title.innerHTML = "<strong>Title: </strong>" + data.jobTitle;
        const email = document.createElement('p');
        email.innerHTML = "<strong>Mail: </strong>" + data.mail;
        const phone = document.createElement('p');
        phone.innerHTML = "<strong>Phone: </strong>+45 " + data.mobilePhone;
        const address = document.createElement('p');
        address.innerHTML = "<strong>Location: </strong>" + data.officeLocation;
        const name = document.createElement('p');
        name.innerHTML = "<strong>Name: </strong>" + data.displayName;


        profileDiv.appendChild(title);
        profileDiv.appendChild(email);
        profileDiv.appendChild(phone);
        profileDiv.appendChild(address);
        profileDiv.appendChild(name)


    } else if (endpoint === graphConfig.graphMailEndpoint) {
        if (data.value.length < 1) {
            alert("Your mailbox is empty!")
        } else {
            const tabList = document.getElementById("list-tab");
            const tabContent = document.getElementById("nav-tabContent");

            data.value.map((d, i) => {
                // Keeping it simple
                if (i < 10) {
                    const listItem = document.createElement("a");
                    listItem.setAttribute("class", "list-group-item list-group-item-action")
                    listItem.setAttribute("id", "list" + i + "list")
                    listItem.setAttribute("data-toggle", "list")
                    listItem.setAttribute("href", "#list" + i)
                    listItem.setAttribute("role", "tab")
                    listItem.setAttribute("aria-controls", i)
                    listItem.innerHTML = d.subject;
                    tabList.appendChild(listItem)

                    const contentItem = document.createElement("div");
                    contentItem.setAttribute("class", "tab-pane fade")
                    contentItem.setAttribute("id", "list" + i)
                    contentItem.setAttribute("role", "tabpanel")
                    contentItem.setAttribute("aria-labelledby", "list" + i + "list")
                    contentItem.innerHTML = "<strong> from: " + d.from.emailAddress.address + "</strong><br><br>" + d.bodyPreview + "...";
                    tabContent.appendChild(contentItem);
                }
            });
        }
    }

}

function showAccounts(accs) {
    const accountList = document.createElement('ul');
    accs.forEach((account) => {
        const listItem = document.createElement('li');
        listItem.textContent = account.username;
        listItem.setAttribute('data-account-id', account.homeAccountId);
        listItem.addEventListener('click', () => {
            accountId = account.homeAccountId;
            showWelcomeMessage(account);
        });
        accountList.appendChild(listItem);
    });
    document.body.appendChild(accountList);
}

document.addEventListener("DomContentLoaded", function () {
    const welcomeMessage = document.getElementById("welcomeMessage");
    welcomeMessage.classList.add("welcome-message")
    welcomeMessage.textContent = "Welcome to the Graph Tutorial!";
})