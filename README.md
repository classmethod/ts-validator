#### This is beta. Please use at your own risk.

TSAS CDK - TypeScript Application for Serverless and AWS CDK
===

A command line tool, supports AWS serverless application development.

* Manage file-based multiple parameters.
* Manage hand-based single parameter.
* Calculate parameter key using application name, environment name, division name.

TypeScript package, supports use Parameter Store Value.

* Use Parameter Store value via TypeScript.

Installation
---
 
```bash
npm i -g tsas-cdk # Cli tool

cd <your cdk project>
npm i -s tsas-cdk # TypeScript package.

```

Usage
---

### CLI

```bash
tsas -h
---
Usage: tsas-cdk [options] [command]

Options:
  -V, --version  output the version number
  -v --verbose   verbose logging mode
  -h, --help     output usage information

Commands:
  init           Init filles
  param          Manage application parameters, [push-all|push-single|list]
  help [cmd]     display help for [cmd]


Usage: tsas-cdk param [options] [command]

Options:
  -V, --version                       output the version number
  -s, --stage <stage>                 parameter stage name
  -d, --division <division>           parameter division, such as "app", "e2e" (default: "app")
  -h, --help                          output usage information

Commands:
  list
  put-all
  put-single [options] <key> <value>
  *
```

### TypeScript


```typescript

// in cdk stack
import * as cdk from '@aws-cdk/core';
import * as ssm from '@aws-cdk/aws-ssm';
import { TsasParameters, TsasParameterManager } from 'tsas-cdk';
 import { RestApi } from 'aws-sdk/clients/apigateway';
import * as tsasCdk from 'tsas-cdk';

export async function cdkStackHelloWorldServer(
    scope: cdk.Construct,
    id: string,
): Promise<void> {
    const stack = new cdk.Stack(scope, id, {
        stackName: 'HelloWorldStack'
    });

    // load ssm parameters
    const pm: TsasParameterManager = new tsasCdk.TsasParameterManager(stage, division);
    const params: TsasParameters = await pm.load();
    const apiVersion = params.ApiVersion.Value;
    
    const apiGateway: RestApi = createApiGateway(apiVersion);

    // register to ssm        
    new ssm.StringParameter(stack, 'HelloWorldApiUrl', {
          parameterName: pm.fullKeyOf('HelloWorldApiUrl', 'e2e'),
          stringValue: apiGateway.url,
    })

}


// in e2e test
import * as tsasCdk from 'tsas-cdk';

describe('Call api', (): void => {
        test('success', async (): Promise<void> => {
    const pm = new tsasCdk.TsasParameterManager('dev', 'e2e'); // env:dev division:e2e
    const params = await pm.load();
    const url = params.HelloWorldApiUrl.Value;
     
    // you can use ssm stored `url`
    console.log(url);
    });
});

``` 


Examples
---

### Requirements

If you need to switch role, you can use these helpful tools.

* [tilfin/homebrew\-aws: AWS commands easy to manipulate on terminal](https://github.com/tilfin/homebrew-aws)
* [cm\-wada\-yusuke/aws\_swrole: Switch AWS IAM Roles to set envriomnent variables\.](https://github.com/cm-wada-yusuke/aws_swrole)


### Create settings

First, `cdk init`.

```bash
tsas-cdk init

What your serverless application name? [hello-service-sls]hellosls
What your default region? [ap-northeast-1]
✅ All done!
```

### Push `dev` stage parameters using file 

```bash
tsas-cdk param put-all --stage dev

putting parameters...
done.
```

### Push individual parameter, such as SaaS token.


```bash
tsas-cdk param put-single -s dev GitHubToken XXXXXXXXXXYYYYYYYYYYYY --secure
```


### List `app`, `e2e` division parameters 

```bash
tsas-cdk param list --stage dev
tsas-cdk param list --stage dev --division e2e
```

