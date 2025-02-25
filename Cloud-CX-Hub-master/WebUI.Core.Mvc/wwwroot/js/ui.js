// Select DOM elements to work with
const mailButton = document.getElementById("readMail");
const profileButton = document.getElementById("seeProfile");
const profileDiv = document.getElementById("profile-div");


function updateUI(data, endpoint) {
    if (!data) {
        console.log('No data returned');
        return;
    } else {
        console.log('Data returned');
    }
    console.log('Graph API responded at: ' + new Date().toString() + ' \n from endpoint: ' + endpoint);
    switch (endpoint) {
        case graphConfig.graphMeEndpoint:
            updateProfileUI(data);
            break;
        case graphConfig.graphMailEndpoint:
            updateEmailUI(data);
            break;
        case graphConfig.graphGroupsEndpoint:
            updateGroupsUI(data);
            break;
        case graphConfig.graphUsersEndpoint:
            updateUsersUI(data);
            break;
        default:
            console.log('Unknown endpoint');
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

function updateProfileUI(data) {
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
    profileDiv.appendChild(name);
}

function updateEmailUI(data) {
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

function updateGroupsUI(data) {
    let groupsDiv = document.getElementById('groupsDiv');
    data.value.forEach(group => {
        const groupElement = document.createElement('p')
        groupElement.innerHTML = '<strong>Group Name: </strong>' + group.displayName;
        groupsDiv.appendChild(groupElement);
    })
}

function updateUsersUI(data) {
    let usersDiv = document.getElementById('usersDiv')
    data.value.forEach(user => {
        const userDiv = document.createElement('div')
        const userName = document.createElement('p');
        userName.innerHTML = "<strong>Name: </strong>" + user.displayName;
        const userTitle = document.createElement('p');
        userTitle.innerHTML = "<strong>Title: </strong>" + user.jobTitle;
        const userEmail = document.createElement('p');
        userEmail.innerHTML = "<strong>Mail: </strong>" + user.mail;
        const userPhone = document.createElement('p');
        userPhone.innerHTML = "<strong>Phone: </strong>+45 " + user.mobilePhone;
        const userAddress = document.createElement('p');
        userAddress.innerHTML = "<strong>Location: </strong>" + user.officeLocation;
        const divider = document.createElement('hr');
        divider.className = "dashed"


        userDiv.appendChild(userName)
        userDiv.appendChild(userTitle)
        userDiv.appendChild(userEmail)
        userDiv.appendChild(userPhone)
        userDiv.appendChild(userAddress)
        userDiv.appendChild(divider)
        usersDiv.appendChild(userDiv)
    })
}




