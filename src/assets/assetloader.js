export async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load JSON: ${path}`);
    return await res.json();
}

export async function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Failed to load image: ${path}`);
    });
}

export async function loadCarAssets() {
    const seeds = await loadJSON('./assets/cars/car_seeds.json');

    const cars = {};

    for (const seed of seeds) {
        const folder = `./assets/cars/${seed.codename}`;

        try {
            const model = await loadJSON(`${folder}/model.json`);

            const sprites = {
                neutral: await loadImage(`${folder}/neutral.png`),
                drift_left: await loadImage(`${folder}/drift_left.png`),
                drift_right: await loadImage(`${folder}/drift_right.png`),
                boost: await loadImage(`${folder}/boost.png`)
            };

            cars[seed.codename] = {
                seed,
                model,
                sprites
            };

        } catch (err) {
            console.warn(`Skipping car ${seed.codename}:`, err);
        }
    }

    return cars;
}

export async function loadCharacterAssets() {
    const characterData = await loadJSON('./assets/characters/character_sprite.json');

    const sprites = {};
    for (const key in characterData.sprites) {
        sprites[key] = await loadImage(`./assets/characters/${characterData.sprites[key]}`);
    }

    return {
        meta: characterData.meta,
        sprites
    };
}

export async function loadAllAssets() {
    const [cars, characters] = await Promise.all([
        loadCarAssets(),
        loadCharacterAssets()
    ]);

    return {
        cars,
        characters
    };
}
