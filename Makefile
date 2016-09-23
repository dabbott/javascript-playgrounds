BIN = ./node_modules/.bin

publish-gh-pages:
ifdef TAG
	git checkout tags/$(TAG) 
	npm run build
	git checkout -b gh-pages
	git add --all *-bundle.js -f
	git commit -m "New release"
	git tag gh-$(TAG)
	git push origin gh-$(TAG)	
	git push -f origin gh-pages:gh-pages
	git checkout tags/$(TAG) 
	git branch -D gh-pages
endif
