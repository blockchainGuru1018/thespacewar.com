module.exports = function (deps) {

    const pagesByName = deps.pagesByName;
    const pageDependencies = deps.pageDependencies;

    pageDependencies.route = route;

    let currentPage;

    return {
        route
    };

    function route(pageName, pageArguments) {
        if (currentPage && currentPage.hide) {
            currentPage.hide();
        }

        let pageConstructor = pagesByName[pageName]
        const page = pageConstructor(pageDependencies);
        currentPage = page;
        page.show(pageArguments);
    }
};