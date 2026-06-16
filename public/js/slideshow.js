// Photo gallery: pictures-per-row selector (1/2/3) + image deletion.
// Uploads are handled separately by the existing slideshow upload form (see
// addToSlideshow.handlebars + pictures.js); this file only controls layout and
// deletion of already-uploaded images.

const galleryGrid = document.getElementById('gallery-grid');
const colButtons = document.querySelectorAll('.gallery-col-button');
const deleteButtons = document.querySelectorAll('.gallery-delete-button');

// --- Pictures-per-row selector ---
function setColumns(cols) {
    cols = Number(cols);
    if (!galleryGrid || ![1, 2, 3].includes(cols)) return;

    galleryGrid.style.setProperty('--gallery-cols', cols);
    colButtons.forEach((btn) => {
        btn.classList.toggle('is-active', Number(btn.dataset.cols) === cols);
    });

    // Remember the choice across page loads.
    try {
        localStorage.setItem('galleryCols', String(cols));
    } catch (e) {
        /* localStorage unavailable; ignore */
    }
}

colButtons.forEach((btn) => {
    btn.addEventListener('click', () => setColumns(btn.dataset.cols));
});

if (galleryGrid) {
    let saved = 3;
    try {
        saved = Number(localStorage.getItem('galleryCols')) || 3;
    } catch (e) {
        saved = 3;
    }
    setColumns(saved); // defaults to 3 when nothing valid is stored
}

// --- Image deletion ---
deleteButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const item = button.closest('.gallery-item');
        const img = item ? item.querySelector('.gallery-image') : null;
        if (!img) return;

        try {
            await handleDeletion(img.src);
            setMessage('Successfully deleted image');
            item.remove();
        } catch (err) {
            console.log(err);
            setError(err);
        }
    });
});

async function handleDeletion(fullImagePath) {
    const filename = fullImagePath.split('/').pop();

    // Presence of the hidden #is-event-page marker means we're on the event page.
    const isEventPage = document.getElementById('is-event-page') != null;

    const response = await fetch('/pictures/slideshow', {
        mode: 'cors',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename: filename,
            isEventPage: isEventPage,
        }),
    });

    return response;
}
