const Docker = require("dockerode");
const semverSort = require("semver-sort");

async function getMods(mcVersion: string) {

    let version = await new Promise<string>((res) => {
        fetch("https://modmaven.dev/net/fabricmc/fabric-api/fabric-api/").then(async x => {
            let versions = (await x.text()).split("\n").filter(x => x.includes(`+${mcVersion}/`));
            versions = versions.map(x => x.split(">")[1].split("/")[0])
            res(semverSort.desc(versions)[0])
        })
    });

    let dependenciesJars = await new Promise<string[]>((res) => {
        fetch(`https://modmaven.dev/net/fabricmc/fabric-api/fabric-api/${version}/fabric-api-${version}.pom`).then(async x => {
            let dependencies = []
            let splitted = (await x.text()).split("\n");
            let idx = splitted.findIndex(x => x.includes("gametest"));
            let artifact = splitted[idx].split(">")[1].split("<")[0];
            let artifactVersion = splitted[idx + 1].split(">")[1].split("<")[0];
            dependencies.push(`https://modmaven.dev/net/fabricmc/fabric-api/${artifact}/${artifactVersion}/${artifact}-${artifactVersion}.jar`)


            idx = splitted.findIndex(x => x.includes("fabric-resource-loader-v0"))
            artifact = splitted[idx].split(">")[1].split("<")[0];
            artifactVersion = splitted[idx + 1].split(">")[1].split("<")[0];
            dependencies.push(`https://modmaven.dev/net/fabricmc/fabric-api/${artifact}/${artifactVersion}/${artifact}-${artifactVersion}.jar`)

            res(dependencies);
        })
    })


    return dependenciesJars.concat([`https://modmaven.dev/net/fabricmc/fabric-api/fabric-api/${version}/fabric-api-${version}.jar`]);
}

async function runDocker(inputs: Inputs) : Promise<boolean> {
    let dck = new Docker();
    let mods = await getMods(inputs.version);

    let binds: string[] = [];
    if (inputs.configPath) binds.push(`${inputs.configPath}:/config`);
    if (inputs.modPath) binds.push(`${inputs.modPath}:/mods`);
    if (inputs.serverPropertiesPath) binds.push(`${inputs.serverPropertiesPath}:/data/server.properties`)

    let env = ["EULA=true", `VERSION=${inputs.version}`, "TYPE=FABRIC", `MODS=${mods.join(",")}`, "JVM_OPTS=-Dfabric-api.gametest"]    
    if (inputs.serverPropertiesPath) env.push("SKIP_SERVER_PROPERTIES=true")

    let res = await dck.run('itzg/minecraft-server:java21-alpine', [], process.stdout, {
        AttachStdout: true,
        AttachStderr: true,
        HostConfig: {
            AutoRemove: true,
            Binds: binds,
        },
        Env: env
    });

    return res[0].StatusCode == 0
}

interface Inputs {
    version: string,
    modPath: string,
    serverPropertiesPath?: string,
    configPath?: string
}

module.exports.default = async function run(inputs: Inputs): Promise<boolean> {
    return await runDocker(inputs)
}