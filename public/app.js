const toformattedCurrency = price => {
    return new Intl.NumberFormat('en-GB', {
        currency: 'eur',
        style: 'currency'
    }).format(price);
}

const toDate = date => {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(date));
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toformattedCurrency(node.textContent);
});

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent);
});

const $card = document.querySelector('.cart');
if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')){
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;

            console.log(csrf);

            fetch('/cart/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                },
            })
                .then(res => res.json())
                .then(card => {
                    if (card.courses.length) {
                        const html = card.courses.map(course => {
                                return `
                                <tr>
                                        <td>${course.title}</td>
                                        <td>${course.count}</td>
                                        <td>
                                          <button class="btn btm-small js-remove" data-id="${course.id}">Remove</button>
                                        </td>
                                      </tr>
                                `;
                        }).join('');
                        $card.querySelector('tbody').innerHTML = html;
                        $card.querySelector('.price').textContent = toformattedCurrency(card.price);
                    } else {
                        $card.innerHTML = '<p>Card is empty</p>';
                    }

            })
        }
    })
}

M.Tabs.init(document.querySelectorAll('.tabs'));