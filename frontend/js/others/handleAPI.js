// Call Api DELETE
export async function deleteData(api, id) {
    const res = await fetch(`${api + '/' + id}`, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        }
    });
    return res;
}

// Call Api POST
export async function postData(api, data) {
    const res = await fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return res;
}

// Call Api PUT
export async function putData(api, data, id) {
    const res = await fetch(`${api + '/' + id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return res;
}

// Call Api GET
export async function getData(api) {
    const res = await fetch(api);
    return res.json();
}