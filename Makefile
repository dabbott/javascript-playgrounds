BIN = ./node_modules/.bin

publish-gh-pages:
	git checkout master
	npm run build
	git checkout -b gh-pages
	git add --all *-bundle.js -f
	git commit -m "New release"
	git push -f origin gh-pages:gh-pages

ifdef TAG
	git tag $(TAG)
	git push origin $(TAG)
endif

	git checkout master
	git branch -D gh-pages
