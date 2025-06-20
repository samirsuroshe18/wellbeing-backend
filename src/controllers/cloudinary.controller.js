import { User } from "../models/user.model.js";
import {Upload} from "../models/upload.model.js";
import {TaskCollection} from "../models/taskCollection.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { v2 as cloud } from "cloudinary";
import fs from 'fs'

cloud.config({
    cloud_name: 'daaciwspp',
    api_key: '843341365436836',
    api_secret: '41kT4bjyG-IkCQlUGLmuL8eWzhY',
});

// 1. URLs you want to keep
const keepUrls = [
    'http://res.cloudinary.com/daaciwspp/image/upload/v1747469599/gloria-smartgate-files/a6nfu2pispgftxz3ytdp.jpg',
    'http://res.cloudinary.com/daaciwspp/image/upload/v1747471018/gloria-smartgate-files/kqicwludtrwq6qosrgj6.jpg',
    'http://res.cloudinary.com/daaciwspp/image/upload/v1747730291/gloria-smartgate-files/flpvltxiccqokyycouyd.jpg',
    'http://res.cloudinary.com/daaciwspp/image/upload/v1747731025/gloria-smartgate-files/scjxwhaznux1vob3oujm.jpg',
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713192834/qwgd1zfttqsrw4cdu0an.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713192876/k51yhoxsngaqyrcqidhe.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713192998/tflqiwpgbdocoujv6pbh.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713193285/xlsx9ij6enrsxktz7yzf.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713195060/p39mszyjdzfp4u1unywz.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713198580/kbapimimyydp9tkcx9x4.png",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713245130/ujlokpgpnvj468gajnvq.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1717583459/ha4pcypuvww3bo3jvjou.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1723481349/g4fcxmg5mni3llkvyvnu.png",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1723497088/jhqllbwyrplwipfldotr.png",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1723543183/erw6qjtbc957jbhv8zue.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745504544/f4vvhufsrymjmgfvdum3.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745505237/fu6etzryxmjkuiu62o4t.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745603918/zrww6h6jt8ufgegttcmv.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745604987/zikyqlkd8xbwa82emtmh.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1710607262/hnvyalyyhyync82ylhte.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1710870428/fauctik7mwrnfxhgpbat.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713245010/xmqj3iasbjsziwwg7oc5.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1723479932/p6nww0wafspvhpb9xvu5.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1723492831/pn2cardwamvoxyjg2ynw.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1723542580/zzkitwnh6xho5pawosel.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1723542931/t3wc7hy4goruentbuucx.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1727621230/hwqcujrqtqv0huxtqbqg.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1729319983/wueaybf7pvyoc70boxgr.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1735124010/rbnij3qvdphz6ouowfbp.png",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1735321639/qxupquamhiqi8itnmiuz.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1742739741/pnrgq8qrf5ypawixh9hw.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1742997315/v3y2mok1vrc6hdxkpdyd.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1743495361/agznfjlhzddwht21lf2r.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1744632620/mti2t0k3x9aavuxkuujb.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1744639634/ldu95kybjbo7ziv9ms0f.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745051873/gndpjj8myneywxdxdpsy.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745079573/ho2avmeprhmqjb2f86cm.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745087683/w579ddgff3adlawjvdl7.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745088235/oqyeythnb84qyfrn2ksa.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745134513/bwiujkr9iinpt02rpv0v.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745425747/u8ugcdvcfzp4ybqm0wwg.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745502149/gj2mghd495ie3lj4frfo.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745503745/ctt4dvu425usxfwzvg67.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745597935/mvqjvxpt63sxarykiycj.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745603266/lzixvhbhs2ngilhkoren.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745603313/dax0bqtk29ft3btvuzny.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745603427/fmnbtxp6gah4fvun0jq6.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1746547562/kycxq3oxbogk4ywnihly.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1748076420/exglmbchj8zvqkzy2ecg.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713190985/kyxshll9vaokzqmnfz5i.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713191330/qenitgvozayeko0dtwz2.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713191459/csauwfyjmnylrxmdhecu.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713191472/ocbypzwqudaj6hufpzwq.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713192204/cg70ebfhinq6cgxh8nw4.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713192333/lmcsdcav0laucspdet65.png",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713192515/nq0v5hapbqpdkuctocu8.png",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713192598/ncmiuaddjau8zs68ohah.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713193777/jukkmsqovyiuxflujgoh.png",
    "http://res.cloudinary.com/daaciwspp/video/upload/v1713194295/i4a7qekshr6xkq7lkofr.mp4",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713195262/aixhb7tzscvlcp0vvbyi.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713195345/f8nxc9de52nrexajbtva.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713195425/czupdtst6kdzhjrbfzxg.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1713195522/lj1ndov6jryykfhltixg.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1743053749/arpmxjt1bmcaohd8medv.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745504454/o98l5y1ozuwvuka9q0d7.jpg",
    "http://res.cloudinary.com/daaciwspp/image/upload/v1745666298/csamoapwceq7xeoyqmsb.jpg"
];

// 2. Folders you want to exclude
const excludeFolders = [];

const getAllResources = asyncHandler(async (req, res) => {
    let allResources = [];
    let nextCursor = null;

    do {
        const result = await cloud.api.resources({
            resource_type: 'image',
            type: 'upload',
            max_results: 500,
            next_cursor: nextCursor
        });

        allResources = allResources.concat(result.resources);
        nextCursor = result.next_cursor;

    } while (nextCursor);

    return res.status(200).json(
        new ApiResponse(200, { length: allResources.length, allResources }, "All resources fetched successfully")
    )
})

const deleteUnwantedFiles = asyncHandler(async (req, res) => {
    const keepPublicIds = keepUrls.map(extractPublicId).filter(Boolean);

    const resourceTypes = ['image', 'video', 'raw']; // raw includes PDFs and others

    for (const type of resourceTypes) {
        let nextCursor = null;

        do {
            const result = await cloud.api.resources({
                resource_type: type,
                max_results: 500,
                next_cursor: nextCursor,
                prefix: '', // optional: set folder if needed like 'gloria-smartgate-files/'
            });

            for (const asset of result.resources) {
                if (!keepPublicIds.includes(asset.public_id)) {
                    console.log(`Deleting ${type}:`, asset.public_id);
                    await cloud.uploader.destroy(asset.public_id, { resource_type: type });
                } else {
                    console.log(`Keeping ${type}:`, asset.public_id);
                }
            }

            nextCursor = result.next_cursor;
        } while (nextCursor);
    }

    console.log("Cleanup completed.");
    return res.status(200).json(
        new ApiResponse(200, {}, "Unwanted files deleted successfully")
    )
})

const updateCloudinaryUrls = asyncHandler(async (req, res) => {
    const updateUrl = (url) => {
            if (!url || typeof url !== "string") return url;
            return url.includes("/upload/wellbeing-files/") 
                ? url // Already updated
                : url.replace("/upload/", "/upload/wellbeing-files/");
        };

        // === Update User model ===
        const users = await User.find({});
        for (const user of users) {
            const newUrl = updateUrl(user.profilePicture);
            if (newUrl !== user.profilePicture) {
                user.profilePicture = newUrl;
                await user.save({ validateBeforeSave: false });
            }
        }

        // === Update TaskCollection model ===
        const tasks = await TaskCollection.find({});
        for (const task of tasks) {
            const newUrl = updateUrl(task.taskReference);
            if (newUrl !== task.taskReference) {
                task.taskReference = newUrl;
                await task.save({ validateBeforeSave: false });
            }
        }

        // === Update Upload model ===
        const uploads = await Upload.find({});
        for (const upload of uploads) {
            const newUrl = updateUrl(upload.multiMedia);
            if (newUrl !== upload.multiMedia) {
                upload.multiMedia = newUrl;
                await upload.save({ validateBeforeSave: false });
            }
        }

        return res.status(200).json({ message: "Cloudinary URLs updated successfully." });
})

// Extract public_id from Cloudinary URL
function extractPublicId(url) {
    const regex = /upload\/(?:v\d+\/)?(.+?)\.(jpg|jpeg|png|gif|mp4|webp)$/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export { getAllResources, deleteUnwantedFiles, updateCloudinaryUrls };