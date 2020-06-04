const OssAli = require('ali-oss');
const rra = require('recursive-readdir-async');
const path = require('path');

const isDir = (filePath = '') => filePath.endsWith('/');
function arrayGroup(data, n = 10) {
  const result = [];
  for (let i = 0; i < data.length; i += n) {
    result.push(data.slice(i, i + n));
  }
  return result;
}

const ACL_POLICE = {
  DEFAULT: 'default',
  PRIVATE: 'private',
  PUBLIC_READ: 'public-read',
  PUBLIC_READ_WRITE: 'public-read-write',
};

class EasyOss {
  constructor({ ossOptions }) {
    this.ossClient = new OssAli(ossOptions);
  }

  /**
   * 上传本地文件
   * @param {string} objectName 对象名
   * @param {string} localFile 本地文件路径
   * @param {boolean} forbidOverwrite 是否禁止同名覆盖
   */
  uploadLocalFile(objectName, localFile, forbidOverwrite = false) {
    return this.ossClient.put(objectName, localFile, {
      headers: {
        'x-oss-forbid-overwrite': forbidOverwrite,
      },
    });
  }

  /**
   * 创建一个文件夹
   * @param {string} dirName 必须以/结尾
   */
  createDir(dirName) {
    return this.ossClient.put(dirName, Buffer.from([]));
  }

  async uploadLocalDir(ossDirName, localDir, onProgress = () => {}) {
    const localDirNormalized = path.resolve(localDir).replace(/\\/g, '/');
    const list = await rra.list(localDir, {
      ignoreFolders: false,
      realPath: true,
    });
    const count = list.length;
    let finished = 0;
    const tasks = list.map(t => () => {
      const ossName = ossDirName + t.fullname.replace(localDirNormalized, '');
      if (t.isDirectory) {
        return this.createDir(ossName + '/').then(() => {
          finished++;
          onProgress({
            fileName: t.fullname + '/',
            ossName: ossName + '/',
            count,
            finished,
          });
          return ossName + '/';
        });
      } else {
        return this.uploadLocalFile(ossName, t.fullname).then(() => {
          finished++;
          onProgress({
            fileName: t.fullname,
            ossName: ossName,
            count,
            finished,
          });
        });
      }
    });
    for (const task of tasks) {
      await task();
    }
  }

  /**
   * 列举指定目录下的文件和子目录
   * @param {string} dir 文件夹，如'abc', 'abc/de/', 留空表示根目录
   * @param {string} marker 翻页标记，只列出文件名大于 marker 之后的文件
   * @returns {Promis<object<{ objects, nextMarker }>>}
   */
  async listDir(dir = '', marker = '') {
    const result = await this.ossClient.list({
      prefix: dir ? (isDir(dir) ? dir : dir + '/') : '',
      delimiter: '/',
      marker,
    });
    return {
      objects: [
        ...(result.objects || []).map(t => ({
          name: t.name,
          lastModified: t.lastModified,
          size: t.size,
          isDir: false,
        })),
        ...(result.prefixes || []).map(t => ({
          name: t,
          lastModified: '',
          size: 0,
          isDir: true,
        })),
      ],
      nextMarker: result.nextMarker,
    };
  }

  async listDirAll(dir = '') {
    const results = [];
    let rel, marker, done;
    while (!done) {
      rel = await this.listDir(dir, marker);
      marker = rel.nextMarker;
      if (!marker) {
        done = true;
      }
      results.push(...rel.objects);
    }
    return results;
  }

  /**
   * 列举指定前缀下的文件和目录（递归）
   * @param {string} prefix 前缀，如 'test', 'abc', 'abc/de/', 留空表示根目录
   * @param {string} marker 翻页标记，只列出文件名大于 marker 之后的文件
   * @returns {Promis<object<{ objects, nextMarker }>>}
   */
  async listPrefix(prefix = '', marker = '') {
    const result = await this.ossClient.list({
      prefix,
      marker,
    });
    return {
      objects: (result.objects || []).map(t => ({
        name: t.name,
        lastModified: t.lastModified,
        size: t.size,
      })),
      nextMarker: result.nextMarker,
    };
  }

  async listPrefixAll(prefix = '') {
    const results = [];
    let rel, marker, done;
    while (!done) {
      rel = await this.listPrefix(prefix, marker);
      marker = rel.nextMarker;
      if (!marker) {
        done = true;
      }
      results.push(...rel.objects);
    }
    return results;
  }

  /**
   * 设置ACL访问策略
   * @param {string} name
   * @param {string} police
   */
  setAcl(name, police = ACL_POLICE.DEFAULT) {
    return this.ossClient.putACL(name, police);
  }

  /**
   * 判断文件是否存在(注意，如果要判断目录是否存在必须以/结尾)
   * @param {string} name
   * @returns {Promis<boolean>}
   */
  exists(name) {
    return this.ossClient
      .get(name)
      .then(result => {
        if (result.res.status == 200) {
          return true;
        }
      })
      .catch(e => {
        if (e.code == 'NoSuchKey') {
          return false;
        }
      });
  }

  delete(name) {
    return this.ossClient.delete(name);
  }

  async deleteDir(dir) {
    const dirName = isDir(dir) ? dir : dir + '/';
    const objects = await this.listPrefixAll(dirName);
    const objectNames = objects.map(t => t.name);
    if (objectNames.length === 0) return;
    const nameGroup = arrayGroup(objectNames, 50);
    for (const objectNamesGroup of nameGroup) {
      await this.ossClient.deleteMulti(objectNamesGroup, { quiet: true });
    }
  }
}

EasyOss.isDir = isDir;
EasyOss.ACL_POLICE = ACL_POLICE;

module.exports = EasyOss;
