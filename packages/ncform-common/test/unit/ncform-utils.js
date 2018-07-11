import assert from 'assert';
import _get from 'lodash-es/get';
import ncformUtils from '../../src/ncform-utils.js';

describe('/src/ncform-utils.js', () => {
  // --- perfectFormSchema

  it("perfectFormSchema - 填充对象", () => {
    let formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        }
      }
    };
    let newFormSchema = ncformUtils.perfectFormSchema(formSchema);
    assert(newFormSchema.globalConfig.style.hasOwnProperty('formCls'));

    formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          ui: {
            widget: 'myCustom'
          }
        }
      },
      globalConfig: {
        style: {
          formCls: 'bs-form'
        }
      }
    };
    newFormSchema = ncformUtils.perfectFormSchema(formSchema);
    assert(newFormSchema.globalConfig.style.formCls === 'bs-form');
    assert(newFormSchema.properties.name.ui.widget === 'my-custom');
  });

  // --- getModelFromSchema

  it("getModelFromSchema - object类型 有value", () => {
    const formSchema = {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          value: 'daniel',
          default: 'name',
          ui: {
            label: 'Username'
          }
        },
        age: {
          type: 'integer',
          value: 5,
          default: 6,
          ui: {
            label: 'Age'
          }
        }
      }
    };
    const result = ncformUtils.getModelFromSchema(formSchema);
    assert(result.username === 'daniel' && result.age === 5);
  });
  it("getModelFromSchema - object类型 只有default值", () => {
    const formSchema = {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          default: 'daniel',
          ui: {
            label: 'Username'
          }
        },
        age: {
          type: 'integer',
          default: 5,
          ui: {
            label: 'Age'
          }
        }
      }
    };
    const result = ncformUtils.getModelFromSchema(formSchema);
    assert(result.username === 'daniel' && result.age === 5);
  });
  it("getModelFromSchema - object类型 底下value高于上级", () => {
    const formSchema = {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          value: 'daniel',
          default: 'name',
          ui: {
            label: 'Username'
          }
        },
        age: {
          type: 'integer',
          value: 5,
          default: 6,
          ui: {
            label: 'Age'
          }
        }
      },
      value: {
        username: 'sarah',
        age: 8
      }
    };
    const result = ncformUtils.getModelFromSchema(formSchema);
    assert(result.username === 'daniel' && result.age === 5);
  });
  it("getModelFromSchema - array类型 有value", () => {
    const formSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'array',
          items: {
            type: 'string'
          },
          value: [
            {
              __dataSchema: {
                type: 'string',
                value: 'daniel',
                default: 'hi'
              }
            },
            {
              __dataSchema: {
                type: 'string',
                value: 'xiao',
                default: 'hi'
              }
            }
          ]
        }
      }
    };
    const result = ncformUtils.getModelFromSchema(formSchema);
    assert(JSON.stringify(result.user) === JSON.stringify(['daniel', 'xiao']));
  });
  it("getModelFromSchema - array类型 只有default值", () => {
    const formSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'array',
          items: {
            type: 'string',
            default: 'hi'
          },
          value: [
            {
              __dataSchema: {
                type: 'string',
                default: 'hi'
              }
            },
            {
              __dataSchema: {
                type: 'string',
                default: 'hi'
              }
            }
          ]
        }
      }
    };
    const result = ncformUtils.getModelFromSchema(formSchema);
    assert(JSON.stringify(result.user) === JSON.stringify(['hi', 'hi']));
  });
  it("getModelFromSchema - array类型 没有值", () => {
    const formSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'array',
          items: {
            type: 'string'
          },
          value: []
        }
      }
    };
    const result = ncformUtils.getModelFromSchema(formSchema);
    assert(JSON.stringify(result.user) === JSON.stringify([]));
  });

  // --- setValueToSchema

  it("setValueToSchema - 普通对象", () => {
    const value = {
      name: 'daniel'
    };
    const formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    console.log(formSchema);
    assert(formSchema.properties.name.value === value.name);
  });
  it("setValueToSchema - 嵌套对象", () => {
    const value = {
      name: {
        firstname: 'daniel',
        lastname: 'xiao'
      }
    };
    const formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'object',
          properties: {
            firstname: { type: 'string' },
            lastname: { type: 'string' }
          }
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    console.log(JSON.stringify(formSchema, null, 2));
    assert(
      formSchema.properties.name.properties.firstname.value ===
        value.name.firstname
    );
    assert(
      formSchema.properties.name.properties.lastname.value ===
        value.name.lastname
    );
  });
  it("setValueToSchema - 对象嵌套数组", () => {
    const value = {
      name: ['daniel', 'xiao']
    };
    const formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'array',
          item: {
            type: 'string'
          }
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    console.log(JSON.stringify(formSchema, null, 2));
    assert(formSchema.properties.name.value === value.name);
  });
  it("setValueToSchema - 普通数组", () => {
    const value = ['daniel', 'sarah'];
    const formSchema = {
      type: 'array',
      items: {
        type: 'string'
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    console.log(JSON.stringify(formSchema, null, 2));
    assert(formSchema.value === value);
  });
  it("setValueToSchema - 嵌套数组", () => {
    const value = [['hi'], ['hello']];
    const formSchema = {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    console.log(JSON.stringify(formSchema, null, 2));
    assert(formSchema.value === value);
  });
  it("setValueToSchema - 非schema的对象", () => {
    const value = {
      name: {
        firstname: 'daniel'
      }
    };
    const formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'object'
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    assert(
      JSON.stringify(formSchema.properties.name.value) ===
        JSON.stringify({ firstname: 'daniel' })
    );
  });
  it("setValueToSchema - 非schema的数组", () => {
    const value = {
      name: ['daniel', 'hi']
    };
    const formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'array'
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    assert(
      JSON.stringify(formSchema.properties.name.value) ===
        JSON.stringify(value.name)
    );
  });
  it("setValueToSchema - 空值赋值默认值", () => {
    let value;
    let formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'object',
          properties: {
            firstname: {
              type: 'string'
            },
            age: {
              type: 'number'
            },
            marry: {
              type: 'boolean'
            },
            info: {
              type: 'object'
            },
            tags: {
              type: 'array'
            }
          }
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    assert(formSchema.properties.name.properties.firstname.value === '');
    assert(formSchema.properties.name.properties.age.value === undefined);
    assert(formSchema.properties.name.properties.marry.value === false);
    assert(
      JSON.stringify(formSchema.properties.name.properties.info.value) ===
        JSON.stringify({})
    );
    assert(
      JSON.stringify(formSchema.properties.name.properties.tags.value) ===
        JSON.stringify([])
    );

    value = {};
    formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'object',
          default: {
            firstname: 'daniel'
          }
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    assert(
      JSON.stringify(formSchema.properties.name.value) ===
        JSON.stringify({ firstname: 'daniel' })
    );
  });
  it("setValueToSchema - 强制覆盖子值", () => {
    const value = {
      name: ['daniel', 'hi']
    };
    let formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'array',
          value: ['sarah']
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema);
    assert(
      JSON.stringify(formSchema.properties.name.value) ===
        JSON.stringify(['sarah'])
    );

    formSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'array',
          value: ['sarah']
        }
      }
    };
    ncformUtils.setValueToSchema(value, formSchema, true);
    assert(
      JSON.stringify(formSchema.properties.name.value) ===
        JSON.stringify(value.name)
    );
  });

  // --- getSchemaByPath
  it("getSchemaByPath - 单纯对象类型", () => {
    let fromSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        }
      }
    };
    let result = ncformUtils.getSchemaByPath(fromSchema, 'name');
    assert(JSON.stringify(result) === JSON.stringify({ type: 'string' }));

    fromSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'object',
          properties: {
            firstname: {
              type: 'string'
            }
          }
        }
      }
    };
    result = ncformUtils.getSchemaByPath(fromSchema, 'name.firstname');
    assert(JSON.stringify(result) === JSON.stringify({ type: 'string' }));
  });
  it("getSchemaByPath - 有数组类型", () => {
    let fromSchema = {
      type: 'object',
      properties: {
        names: {
          type: 'array',
          items: {
            type: 'string'
          },
          value: [
            {
              __dataSchema: {
                type: 'string'
              }
            },
            {
              __dataSchema: {
                type: 'string'
              }
            }
          ]
        }
      }
    };
    let result = ncformUtils.getSchemaByPath(fromSchema, 'names[0]');
    assert(JSON.stringify(result) === JSON.stringify({ type: 'string' }));

    fromSchema = {
      type: 'object',
      properties: {
        person: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phones: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          },
          value: [
            {
              __dataSchema: {
                type: 'object',
                properties: {
                  phones: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    value: [
                      {
                        __dataSchema: {
                          type: 'string'
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    };
    result = ncformUtils.getSchemaByPath(fromSchema, 'person[0].phones[0]');
    assert(JSON.stringify(result) === JSON.stringify({ type: 'string' }));
  });
  it("getSchemaByPath - 数组项之间", () => {
    let fromSchema = {
      type: 'object',
      properties: {
        names: {
          type: 'array',
          items: {
            type: 'string'
          },
          value: [
            {
              __dataSchema: {
                type: 'string'
              }
            },
            {
              __dataSchema: {
                type: 'string'
              }
            }
          ]
        }
      }
    };
    let result = ncformUtils.getSchemaByPath(fromSchema, 'names[i]', '0');
    assert(JSON.stringify(result) === JSON.stringify({ type: 'string' }));

    fromSchema = {
      type: 'object',
      properties: {
        person: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phones: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          },
          value: [
            {
              __dataSchema: {
                type: 'object',
                properties: {
                  phones: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    value: [
                      {
                        __dataSchema: {
                          type: 'string'
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    };
    result = ncformUtils.getSchemaByPath(
      fromSchema,
      'person[i].phones[i]',
      '0,0'
    );
    assert(JSON.stringify(result) === JSON.stringify({ type: 'string' }));
  });

  // --- smartAnalyzeVal

  it("smartAnalyzeVal - 普通值", () => {
    let result = ncformUtils.smartAnalyzeVal('hello daniel');
    assert(result === 'hello daniel');
    result = ncformUtils.smartAnalyzeVal(true);
    assert(result === true);
    result = ncformUtils.smartAnalyzeVal(11);
    assert(result === 11);
    result = ncformUtils.smartAnalyzeVal({ name: 'daniel' });
    assert(JSON.stringify(result) === JSON.stringify({ name: 'daniel' }));
    result = ncformUtils.smartAnalyzeVal(['daniel']);
    assert(JSON.stringify(result) === JSON.stringify(['daniel']));
  });

  it("smartAnalyzeVal - 函数值", () => {
    const rootData = { name: 'daniel' };
    const sayHi = 'hi';

    const val = function(formData) {
      return `${sayHi} ${formData.name}` === 'hi daniel';
    };
    const result = ncformUtils.smartAnalyzeVal(val, { data: { rootData } });
    assert(result === true);
  });

  it("smartAnalyzeVal - 特殊字符串", () => {
    const rootData = { persons: [{ age: 18 }, { age: 20 }] };
    const constData = { max: 18 };

    let val = 'dx: {{$root.persons[0].age}} === 18';
    let result = ncformUtils.smartAnalyzeVal(val, { data: { rootData } });
    assert(result === true);

    val = 'dx: {{$root.persons[i].age}} > 19';
    result = ncformUtils.smartAnalyzeVal(val, {
      idxChain: '1',
      data: { rootData }
    });
    assert(result === true);

    val = 'dx: {{$root.persons[i].age}} < 19';
    result = ncformUtils.smartAnalyzeVal(val, {
      idxChain: '1',
      data: { rootData }
    });
    assert(result === false);

    val = 'dx: {{$root.persons[i].age}} === {{$const.max}}';
    result = ncformUtils.smartAnalyzeVal(val, {
      idxChain: '0',
      data: { rootData, constData }
    });
    assert(result === true);

    val = 'dx: {{$self}}';
    result = ncformUtils.smartAnalyzeVal(val, {
      idxChain: '0',
      data: { selfData: 'hello daniel' }
    });
    assert(result === 'hello daniel');
  });

  it("smartAnalyzeVal - 特殊字符串 嵌套数组", () => {
    const rootData = {
      persons: [[{ age: 12 }, { age: 18 }], [{ age: 50 }, { age: 80 }]]
    };

    const val = 'dx: {{$root.persons[i][i].age}} === 50';
    const result = ncformUtils.smartAnalyzeVal(val, {
      idxChain: '1,0',
      data: { rootData }
    });
    assert(result === true);
  });

  // --- smartAnalyze
  it("smartAnalyze - 普通值", () => {
    let result = ncformUtils.smartAnalyze('hello daniel');
    assert(result === 'hello daniel');
    result = ncformUtils.smartAnalyze(true);
    assert(result === true);
    result = ncformUtils.smartAnalyze(11);
    assert(result === 11);
    result = ncformUtils.smartAnalyze({ name: 'daniel' });
    assert(JSON.stringify(result) === JSON.stringify({ name: 'daniel' }));
    result = ncformUtils.smartAnalyze(['daniel']);
    assert(JSON.stringify(result) === JSON.stringify(['daniel']));
  });
  it("smartAnalyze - 函数值", () => {
    const val = function(itemValue, formData) {
      return `${formValue.name}'s age is ${itemValue.age}`;
    };
    const itemValue = { age: 18 };
    let formValue = { name: 'daniel' };
    const result = ncformUtils.smartAnalyze(val, {
      data: [
        { symbol: '$item', value: itemValue },
        { symbol: '$form', value: formValue }
      ]
    });
    assert(result === "daniel's age is 18");
  });
  it("smartAnalyze - 特殊字符串", () => {
    const value = { age: 2 };
    const val = 'dx: {{$item.age}} + 18';
    const result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$item', value }]
    });
    assert(result === 20);
  });
  it("smartAnalyze - e表达式", () => {
    let value = [{ id: 2 }, { id: 4 }];
    let val = 'dx: {{$selected[e].id}}';
    let result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$selected', value }]
    });
    assert(JSON.stringify(result) === JSON.stringify([2, 4]));

    value = ['daniel', 'sarah'];
    val = 'dx: {{$selected[e]}}';
    result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$selected', value }]
    });
    assert(JSON.stringify(result) === JSON.stringify(value));

    value = { name: [{ id: 2 }, { id: 4 }] };
    val = 'dx: {{$selected.name[e].id}}';
    result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$selected', value }]
    });
    assert(JSON.stringify(result) === JSON.stringify([2, 4]));

    value = { name: [[{ id: 1 }, { id: 11 }], [{ id: 2 }]] };
    val = 'dx: {{$selected.name[0][e].id}}';
    result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$selected', value }]
    });
    assert(JSON.stringify(result) === JSON.stringify([1, 11]));
  });
  it("smartAnalyze - 根数据是数组", () => {
    let value = ['hi', 'hello'];
    let val = 'dx: {{$items[0]}} + " daniel"';
    let result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$items', value }]
    });
    assert(result === 'hi daniel');

    value = ['hi', 'hello'];
    val = 'dx: {{$items[i]}} + " daniel"';
    result = ncformUtils.smartAnalyze(val, {
      idxChain: '1',
      data: [{ symbol: '$items', value }]
    });
    assert(result === 'hello daniel');

    value = ['hi', 'hello'];
    val = 'dx: {{$items[e]}}';
    result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$items', value }]
    });
    assert(result[0] === 'hi' && result[1] === 'hello');

    value = [{ msg: 'hi' }, { msg: 'hello' }];
    val = 'dx: {{$items[i].msg}} + " daniel"';
    result = ncformUtils.smartAnalyze(val, {
      idxChain: '1',
      data: [{ symbol: '$items', value }]
    });
    assert(result === 'hello daniel');
  });
  it("smartAnalyze - 根数据是对象，直接访问对象值", () => {
    const value = { age: 2 };
    const val = 'dx: {{$item}}';
    const result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$item', value }]
    });
    assert(result.age === 2);
  });
  it("smartAnalyze - 根数据是数组，直接访问数组值", () => {
    const value = ['daniel', 'sarah'];
    const val = 'dx: {{$items}}';
    const result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$items', value }]
    });
    assert(result[0] === 'daniel');
  });
  it("smartAnalyze - 根数据是原始类型", () => {
    const value = 'hi';
    const val = 'dx: {{$msg}} + " daniel"';
    const result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$msg', value }]
    });
    assert(result === 'hi daniel');
  });
  it("smartAnalyze - 取一个不存在的值", () => {
    const value = {};
    const val = 'dx: {{$data.name}}';
    const result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$data', value }]
    });
    assert(result === undefined);
  });

  it("smartAnalyze - 不修改输入的data", () => {
    const value = { name: 'kyle' };
    const val = 'dx: {{$data.name}}';
    const valueString1 = JSON.stringify(value);
    const result = ncformUtils.smartAnalyze(val, {
      data: [{ symbol: '$data', value }]
    });
    const valueString2 = JSON.stringify(value);
    assert(valueString1 === valueString2);
  });

  // --- getDefVal
  it("getDefVal - 验证所有数据类型的默认值是否正确", () => {
    const stringDefVal = ncformUtils.getDefVal('string');
    assert(stringDefVal === '');

    const numberDefVal = ncformUtils.getDefVal('number');
    assert(numberDefVal === undefined);

    const integerDefVal = ncformUtils.getDefVal('integer');
    assert(integerDefVal === undefined);

    const booleanDefVal = ncformUtils.getDefVal('boolean');
    assert(booleanDefVal === false);

    const objectDefVal = ncformUtils.getDefVal('object');
    assert(JSON.stringify(objectDefVal) === JSON.stringify({}));

    const arrayDefVal = ncformUtils.getDefVal('array');
    assert(arrayDefVal.length === 0);
  });

  // --- getValType
  it("getValType - 验证所有数据类型是否正确", () => {
    const undefinedType = ncformUtils.getValType(undefined);
    assert(undefinedType === 'undefined');

    const stringType = ncformUtils.getValType('hi');
    assert(stringType === 'string');

    const numberType = ncformUtils.getValType(11);
    assert(numberType === 'number');

    const arrayType = ncformUtils.getValType([]);
    assert(arrayType === 'array');

    const objectType = ncformUtils.getValType({});
    assert(objectType === 'object');

    const bolleanType = ncformUtils.getValType(true);
    assert(bolleanType === 'boolean');
  });

  // --- notEmptyVal
  it("notEmptyVal - 验证所有数据类型的空数据", () => {
    let result = ncformUtils.notEmptyVal(undefined);
    assert(!result);

    result = ncformUtils.notEmptyVal('');
    assert(!result);

    result = ncformUtils.notEmptyVal(NaN);
    assert(!result);

    result = ncformUtils.notEmptyVal([]);
    assert(!result);

    result = ncformUtils.notEmptyVal({});
    assert(!result);

    result = ncformUtils.notEmptyVal(false);
    assert(result);
  });

  // --- priorityGetValue
  it("priorityGetValue - 基础类型", () => {
    let result = ncformUtils.priorityGetValue(
      'basic',
      'first',
      'daniel',
      'simon'
    );
    assert(result === 'first');
    result = ncformUtils.priorityGetValue(
      'basic',
      undefined,
      'daniel',
      'simon'
    );
    assert(result === 'daniel');
    result = ncformUtils.priorityGetValue('basic', undefined, null, 'simon');
    assert(result === 'simon');
  });
  it("priorityGetValue - 对象类型", () => {
    let result = ncformUtils.priorityGetValue(
      'object',
      { a: 1 },
      { b: 2 },
      { a: 2 }
    );
    assert(JSON.stringify(result) === JSON.stringify({ a: 1, b: 2 }));
    result = ncformUtils.priorityGetValue(
      'object',
      undefined,
      { a: 1 },
      { a: 2 }
    );
    assert(JSON.stringify(result) === JSON.stringify({ a: 1 }));
    result = ncformUtils.priorityGetValue('object', undefined, null, { a: 1 });
    assert(JSON.stringify(result) === JSON.stringify({ a: 1 }));
  });
  it("priorityGetValue - 数组类型", () => {
    let result = ncformUtils.priorityGetValue(
      'array',
      ['a'],
      ['b'],
      ['a', 'c']
    );
    assert(JSON.stringify(result) === JSON.stringify(['a', 'c']));
    result = ncformUtils.priorityGetValue(
      'array',
      undefined,
      [{ a: 1 }],
      [{ b: 1 }]
    );
    assert(result[0].a == 1 && result[0].b === 1);
    result = ncformUtils.priorityGetValue('object', undefined, null, ['a']);
    assert(JSON.stringify(result) === JSON.stringify(['a']));
  });

  // --- genRandomId
  it("genRandomId", () => {
    let result = ncformUtils.genRandomId();
    assert(result.length === 5);
    result = ncformUtils.genRandomId(8);
    assert(result.length === 8);
    result = ncformUtils.genRandomId(11);
    assert(result.length === 10);
  });
});
