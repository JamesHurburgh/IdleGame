@echo off
>..\www\data\adventurers.json echo [{}
for /r ".\adventurers\" %%F in (*.json) do (
	echo , >>..\www\data\adventurers.json
	type "%%F" >>..\www\data\adventurers.json
)
>>..\www\data\adventurers.json echo ]