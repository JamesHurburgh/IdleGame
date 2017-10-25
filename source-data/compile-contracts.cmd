@echo off
>..\www\data\contracts.json echo [{}
for /r ".\contracts\" %%F in (*.json) do (
	echo , >>..\www\data\contracts.json
	type "%%F" >>..\www\data\contracts.json
)
>>..\www\data\contracts.json echo ]