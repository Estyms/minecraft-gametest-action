# Minecraft-Gametest-Action

This is an action that runs the gametests on an headless server on fabric (soon forge)

## Features

- Change minecraft version
- Add multiples mods
- Change config
- Change server.properties

## Variables

- `version [Required]` : Version of minecraft you wanna use (defaults to LATEST)
- `modPath [Required]` : The path of the mod folder inside your github action runner
- `configPath` : The path of the config folder you wanna use inside your github action runner
- `serverPropertiesPath` : The path of the server.properties file you wanna use inside your github action runner

## Credits
- [Docker minecraft server](https://docker-minecraft-server.readthedocs.io/en/latest/) by [itzg](https://github.com/itzg)
