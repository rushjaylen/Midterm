console.log("Starting Application...");

let apiBaseUrl = "https://cs.indstate.edu/~lmay1/apis/fake-people/api";
let usersJsonUrl = `${apiBaseUrl}/users.json`;
let usersBaseUrl = `${apiBaseUrl}/users`;
let imageBaseUrl = `${usersBaseUrl}/images`;

let alphabeticalUsersList;
let users_idMap = new Map();

async function getUserDetail(userId) {
    let savedUser = users_idMap.get(userId);
    if (!savedUser.address) {
        savedUser.imageUrl = `${imageBaseUrl}/${userId}.jpeg`;
        savedUser.dataUrl = `${usersBaseUrl}/${userId}.json`;
        let fetchResult = await fetch(savedUser.dataUrl);
        let apiResult = await fetchResult.json();
        Object.assign(savedUser, apiResult.data);
    }
    console.log(savedUser);
    return savedUser;
}

window.toggleProfileView = async function(event) {
    let targetEl = event.target;
    while (!targetEl.id) {
        targetEl = targetEl.parentElement;
    }
    let user = await getUserDetail(targetEl.id);

    // Expanded View Previously Created
    if (targetEl.getAttribute("data-toggle-state") === "expanded") {
        targetEl.children[1].setAttribute("hidden", true);
        targetEl.setAttribute("data-toggle-state", "collapsed");
        return;
    }

    if (targetEl.getAttribute("data-toggle-state") === "collapsed") {
        targetEl.children[1].removeAttribute("hidden");
        targetEl.setAttribute("data-toggle-state", "expanded");
        return;
    }

    let html = `
<div class="column">
    <img class="profile-img" src="${user.imageUrl}" />
</div>
<div class="column">
    `.trim();
    let toExclude = ["id", "imageUrl", "dataUrl"];
    for (let [k, v] of Object.entries(user)) {
        if (toExclude.includes(k)) continue;
        html += `
    <span class="labels">${k}</span> &nbsp; &nbsp; &nbsp; &nbsp; <span class="values">${v}</span></br>
        `.trim();
    }
    html += `
</div>
    `.trim();

    targetEl.children[1].innerHTML = html;
    targetEl.children[1].removeAttribute("hidden");
    targetEl.setAttribute("data-toggle-state", "expanded");
};

// Main Program
let fetchResult = await fetch(usersJsonUrl);
let apiResult = await fetchResult.json();

alphabeticalUsersList = apiResult.data;
alphabeticalUsersList.sort((a, b) => {
    if (a.fullName < b.fullName) return -1;
    if (a.fullName > b.fullName) return 1;
    return 0;
});

let contentEl = document.querySelector(".page-content");
let html = contentEl.innerHTML;
html += `<hr/>`;
for (let user of alphabeticalUsersList) {
    users_idMap.set(user.id, user);
    html += `
<div id=${user.id} class="card" onclick="toggleProfileView(event)">
    <div class="username">${user.fullName}</div>
    <div class="expended-view" hidden></div>
</div>
<hr/>
    `.trim();
}

html += `<div class="page-end-spacer"></div>`;
contentEl.innerHTML = html;