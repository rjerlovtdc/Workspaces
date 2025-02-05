/**
 * @module ndFavorites
*/


/* Global Variables */
versionObj.ndfavoritesny = 37;
var FavoritesDT;
var ndUserFavoritesArr = [];


/** @function 
 * @name buildFavoritesList
 * @async
 * @description Build list of favorites
 * @since 1.0.0.0
*/
const buildFavoritesList = async () => {
    console.debug("(buildFavoritesList) In");
    let indexFound;

    for (const employeeId of favoritesEmpArr) {

        indexFound = ndUserFavoritesArr.findIndex(x => x.id.toString() === employeeId);
        if (indexFound !== -1) {
            continue;
        }

        console.debug("(buildFavoritesList) employeeId", employeeId);
        let ndUser = "";

        switch (custObj.customerKey) {
            case "2647119":  //Region H
                ndUser = await getUserFromCBAS(employeeId);
                break;
            default:
                ndUser = await getUserFromPuzzel(employeeId);
                break;
        }

        if (ndUser.statusText === "NotFound") {
            //Remove Favorite
            indexFound = favoritesEmpArr.indexOf(employeeId);
            favoritesEmpArr.splice(indexFound, 1);
            console.warn("(buildFavoritesList) User NotFound", employeeId);
            continue;
        }

        ndUserFavoritesArr.push(ndUser);
    }

    console.debug("(buildFavoritesList) ndUserFavoritesArr", ndUserFavoritesArr);
    console.debug("(buildFavoritesList) favoritesEmpArr", favoritesEmpArr);

    localStorage.setItem('nd_puzzel_favo_emp', JSON.stringify(favoritesEmpArr));

    console.debug("(buildFavoritesList) Out");
}