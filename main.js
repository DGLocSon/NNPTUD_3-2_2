async function getData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        let body = document.getElementById('table_body');
        body.innerHTML = '';
        for (const post of posts) {
            const deletedStyle = post.isDeleted ? 'style="text-decoration: line-through; color: #888"' : '';
            const action = post.isDeleted ? '<td>Deleted</td>' : `<td><input type='submit' value='Delete' onclick='Delete(${post.id})'></td>`;
            body.innerHTML += `<tr>
                <td>${post.id}</td>
                <td ${deletedStyle}>${post.title}</td>
                <td ${deletedStyle}>${post.views}</td>
                ${action}
            </tr>`;
        }
    } catch (error) {
        console.log(error);
    }
}
async function Save() {
    let id = document.getElementById('txt_id').value.trim();
    let title = document.getElementById('txt_title').value;
    let views = document.getElementById('txt_views').value;

    if (!id) {
        // Create new with auto-increment id = maxId + 1
        let allRes = await fetch('http://localhost:3000/posts');
        let allPosts = await allRes.json();
        let maxId = allPosts.reduce((acc, p) => Math.max(acc, Number(p.id)), 0);
        let newId = maxId + 1;
        let res = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: String(newId),
                title: title,
                views: views,
                isDeleted: false
            })
        })
        if (res.ok) {
            console.log("created successfully");
            getData();
        }
    } else {
        // edit existing (preserve isDeleted)
        let getItem = await fetch('http://localhost:3000/posts/' + id);
        if (getItem.ok) {
            let existing = await getItem.json();
            let res = await fetch('http://localhost:3000/posts/'+id, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    views: views
                })
            })
            if (res.ok) {
                console.log("updated successfully");
                getData();
            }
        } else {
            // provided id but not found - create with given id
            let res = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    title: title,
                    views: views,
                    isDeleted: false
                })
            })
            if (res.ok) {
                console.log("created with provided id");
                getData();
            }
        }
    }
}
async function Delete(id) {
    // Soft delete: set isDeleted = true
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ isDeleted: true })
    })
    if (res.ok) {
        console.log("soft-deleted");
        getData();
    }
}
getData();

